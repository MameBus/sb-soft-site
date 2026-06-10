# SES Domain for receiving
resource "aws_ses_domain_identity" "contact_domain" {
  domain = "inbound.sbox-soft.com"
}

# Verification TXT record, tells AWS that we do actually own this domain
resource "cloudflare_dns_record" "contact_verification" {
  zone_id = data.cloudflare_zone.main.zone_id
  name    = "_amazonses.inbound"
  type    = "TXT"
  content = "\"${aws_ses_domain_identity.contact_domain.verification_token}\""
  ttl     = 3600 # 1 Hour
}

# Blocks until verification is completed
resource "aws_ses_domain_identity_verification" "contact_identity_verification" {
  domain     = aws_ses_domain_identity.contact_domain.id
  depends_on = [cloudflare_dns_record.contact_verification, aws_ses_domain_identity.contact_domain]
}

# Mail from to configure sender domain instead of amazon default
resource "aws_ses_domain_mail_from" "contact_mail_from" {
  domain           = aws_ses_domain_identity.contact_domain.domain
  mail_from_domain = "mail.inbound.sbox-soft.com"
}

# DKIM generation resource
resource "aws_ses_domain_dkim" "contact_dkim" {
  domain = aws_ses_domain_identity.contact_domain.domain
}

# CNAME records used for dkim, redirects over to AWS which handles cryptographic crap that I don't understand
resource "cloudflare_dns_record" "contact_dkim" {
  count   = 3
  zone_id = data.cloudflare_zone.main.zone_id
  ttl     = 3600 # 1 hour
  type    = "CNAME"
  # For each dkim
  name    = "${aws_ses_domain_dkim.contact_dkim.dkim_tokens[count.index]}._domainkey"
  content = "${aws_ses_domain_dkim.contact_dkim.dkim_tokens[count.index]}.dkim.amazonses.com"

  depends_on = [aws_ses_domain_identity.contact_domain]
}

# Cloudflare record for inbound receving emails
resource "cloudflare_dns_record" "inbound_mx" {
  zone_id  = data.cloudflare_zone.main.zone_id
  ttl      = 3600 # 1 hour
  type     = "MX"
  name     = "inbound"
  content  = "inbound-smtp.us-east-1.amazonses.com"
  priority = 1
}

# SPF TXT record, authorizes that amazonses.com is allowed to send emails from this domain
resource "cloudflare_dns_record" "contact_spf" {
  zone_id = data.cloudflare_zone.main.zone_id
  ttl     = 3600 # 1 hour
  type    = "TXT"
  name    = "inbound"
  content = "\"v=spf1 include:amazonses.com ~all\""
}

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
  recipients    = ["contact@inbound.sbox-soft.com"]
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
