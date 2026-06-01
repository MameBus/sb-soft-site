# S3 bucket for storing received contact emails
resource "aws_s3_bucket" "contact_emails" {
  bucket = "sbox-soft-contact-emails"
}

# Some encryption stuff to make sure Emails are securely stored
resource "aws_kms_key" "contact_key" {
  description             = "Key for SES email encryption"
  deletion_window_in_days = 10

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::786401692952:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "AllowSESToUseKeyViaIAMRole"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.ses_receipt_role.arn
        }
        Action = [
          "kms:GenerateDataKey",
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_s3_bucket_server_side_encryption_configuration" "contact_encryption" {
  bucket = aws_s3_bucket.contact_emails.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.contact_key.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

# Make it private, no public access into it
resource "aws_s3_bucket_public_access_block" "contact_emails" {
  bucket = aws_s3_bucket.contact_emails.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Make it so that all bucket contents are owned by the bucket owner

resource "aws_s3_bucket_ownership_controls" "contact_emails" {
  bucket = aws_s3_bucket.contact_emails.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# SNS for sending off emails to some subscribers
resource "aws_sns_topic" "contact_notification" {
  name = "sbox-soft-contact-emails-notification"
}

# SNS topic permission policy
resource "aws_sns_topic_policy" "contact_sns_policy" {
  arn = aws_sns_topic.contact_notification.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowSESPublish"
        Effect = "Allow"
        Principal = {
          Service = "ses.amazonaws.com"
        }
        Action   = "sns:Publish"
        Resource = aws_sns_topic.contact_notification.arn
        Condition = {
          StringEquals = {
            "AWS:SourceAccount" = "786401692952"
          }
        }
      }
    ]
  })
}

resource "aws_ses_receipt_rule_set" "contact_rules" {
  rule_set_name = "contact-rules"
}

# Rule set related to contact emails
resource "aws_ses_active_receipt_rule_set" "contact_rules" {
  rule_set_name = aws_ses_receipt_rule_set.contact_rules.rule_set_name
}

# Permissions for ses to access s3 and sns
resource "aws_iam_role" "ses_receipt_role" {
  name = "ses-receipt-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ses.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "ses_s3_policy" {
  name = "ses-s3-write"
  role = aws_iam_role.ses_receipt_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject"
        ]
        Resource = "${aws_s3_bucket.contact_emails.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:GenerateDataKey",
          "kms:Encrypt",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.contact_key.arn
      }
    ]
  })
}

resource "aws_iam_role_policy" "ses_sns_policy" {
  name = "ses-sns-publish"
  role = aws_iam_role.ses_receipt_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "sns:Publish"
      Resource = aws_sns_topic.contact_notification.arn
    }]
  })
}

# Rule for actioning contact emails
resource "aws_ses_receipt_rule" "contact_notify" {
  name          = "notify"
  rule_set_name = aws_ses_receipt_rule_set.contact_rules.rule_set_name
  recipients    = ["contact@sbox-soft.com"]
  enabled       = true
  scan_enabled  = true

  s3_action {
    bucket_name  = aws_s3_bucket.contact_emails.bucket
    position     = 1
    iam_role_arn = aws_iam_role.ses_receipt_role.arn
  }

  sns_action {
    topic_arn = aws_sns_topic.contact_notification.arn
    position  = 2
  }
}
