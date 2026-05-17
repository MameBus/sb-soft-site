# Note if any resources change region will need to revisit because ACM must be us-east-1
provider "aws" {
  region = "us-east-1"
}

provider "cloudflare" {
}

# ---------- s3 ----------

# The bucket itself 

resource "aws_s3_bucket" "sbox_soft_site_s3" {
  bucket = "sbox-soft-site-s3"

  tags = {
    Name        = "sbox-soft-site-s3"
    Environment = "Prod"
  }
}

# Make it private, no public access into it

resource "aws_s3_bucket_public_access_block" "sbox_soft_site_s3" {
  bucket = aws_s3_bucket.sbox_soft_site_s3.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Make it so that all bucket contents are owned by the bucket owner

resource "aws_s3_bucket_ownership_controls" "sbox_soft_site_s3" {
  bucket = aws_s3_bucket.sbox_soft_site_s3.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# The policy for allowing cloudfront to access it https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html

resource "aws_s3_bucket_policy" "allow_cloudfront" {
  bucket = aws_s3_bucket.sbox_soft_site_s3.id

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
        {
        "Sid" : "AllowCloudFrontServicePrincipalReadOnly",
        "Effect" : "Allow",
        "Principal" : {
            "Service" : "cloudfront.amazonaws.com"
        },
        "Action" : "s3:GetObject",
        "Resource" : "${aws_s3_bucket.sbox_soft_site_s3.arn}/*",
        "Condition" : {
            "StringEquals" : {
            "AWS:SourceArn" : aws_cloudfront_distribution.cdn.arn
            }
        }
        }
    ]
  })
}

# ---------- cloudfront ----------

# The access control saying where the stuff comes from

resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "sbox-site-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ACM certificate for enabling HTTPS

resource "aws_acm_certificate" "cert" {
  domain_name       = "www.sbox-soft.com"
  validation_method = "DNS"

subject_alternative_names = ["sbox-soft.com"]

  lifecycle {
    create_before_destroy = true
  }
}
# The actual cloudfront distribution

resource "aws_cloudfront_distribution" "cdn" {
  # Where content comes from
  origin {
    domain_name = aws_s3_bucket.sbox_soft_site_s3.bucket_regional_domain_name
    origin_id   = "s3-origin"

    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  # Self explainatory
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # Cheapest

  tags = {
    Environment = "Prod"
  }

  aliases = [
    "www.sbox-soft.com",
    "sbox-soft.com"
  ]

  # Defines what / how it will cache https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-origin"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  # No geographic restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

# Cert TODO change to custom domain name
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate_validation.cert.certificate_arn
    ssl_support_method  = "sni-only"
    }
}


# ---------- cloudflare ----------

data "cloudflare_zone" "main" {
  filter = {
    name = "sbox-soft.com"
  }
}

// https://registry.terraform.io/providers/-/aws/latest/docs/resources/acm_certificate_validation

resource "cloudflare_dns_record" "cert" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  zone_id = data.cloudflare_zone.main.zone_id
  name    = each.value.name
  ttl     = 60
  content   = each.value.record
  type    = each.value.type
}

resource "aws_acm_certificate_validation" "cert" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.resource_record_name
  ]
}

# Cloudflare DNS to send traffic over to cloudfront
resource "cloudflare_dns_record" "www" {
  zone_id = data.cloudflare_zone.main.zone_id
  name = "www.sbox-soft.com"
  ttl = 3600
  type = "CNAME"
  content = aws_cloudfront_distribution.cfn.domain_name
  proxied = false
}

resource "cloudflare_dns_record" "root" {
  zone_id = data.cloudflare_zone.main.zone_id
  name = "sbox-soft.com"
  ttl = 3600
  type = "CNAME"
  content = aws_cloudfront_distribution.cfn.domain_name
  proxied = false
}