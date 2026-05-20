# -- SES Domain --

resource "aws_ses_domain_identity" "newsletter_domain" {
  domain = "sbox-soft.com"
}

# -- SES / Cloudflare stuff --

# Verification TXT record, tells AWS that we do actually own this domain
resource "cloudflare_dns_record" "ses_verification" {
  zone_id = data.cloudflare_zone.main.zone_id
  name    = "_amazonses"
  type    = "TXT"
  content = aws_ses_domain_identity.newsletter_domain.verification_token
  ttl     = 3600 # 1 Hour
}

# Blocks until verification is completed
resource "aws_ses_domain_identity_verification" "identity_verification" {
  domain     = aws_ses_domain_identity.newsletter_domain.id
  depends_on = [cloudflare_dns_record.ses_verification, aws_ses_domain_identity.newsletter_domain]
}

# DKIM generation resource - requires ownership to be confirmed first
resource "aws_ses_domain_dkim" "dkim" {
  domain = aws_ses_domain_identity.newsletter_domain.domain
}

# Mail from to configure sender domain instead of amazon default
resource "aws_ses_domain_mail_from" "mail_from" {
  domain           = aws_ses_domain_identity.newsletter_domain.domain
  mail_from_domain = "mail.sbox-soft.com"
}

# CNAME records used for dkim, redirects over to AWS which handles cryptographic crap that I don't understand
resource "cloudflare_dns_record" "dkim" {
  count   = 3
  zone_id = data.cloudflare_zone.main.zone_id
  ttl     = 3600 # 1 hour
  type    = "CNAME"
  # For each dkim
  name    = "${aws_ses_domain_dkim.dkim.dkim_tokens[count.index]}.domainkey"
  content = "${aws_ses_domain_dkim.dkim.dkim_tokens[count.index]}.dkim.amazonses.com"

  depends_on = [aws_ses_domain_identity.newsletter_domain]
}

# MX record, this says what do with mail going to this domain
resource "cloudflare_dns_record" "mx" {
  zone_id = data.cloudflare_zone.main.zone_id
  ttl     = 3600 # 1 hour
  type    = "MX"
  name    = "mail"
  content = "feedback-smtp.us-east-1.amazonses.com"
}

# SPF TXT record, authorizes that amazonses.com is allowed to send emails from this domain
resource "cloudflare_dns_record" "spf" {
  zone_id = data.cloudflare_zone.main.zone_id
  ttl     = 3600 # 1 hour
  type    = "TXT"
  name    = "mail"
  content = "v=spf1 include:amazonses.com ~all"
}

# DMARC record, tells how to handle any mail where the other verification stuff fails to prevent people spoofing the address
resource "cloudflare_dns_record" "dmarc" {
  zone_id = data.cloudflare_zone.main.zone_id
  ttl     = 3600 # 1 hour
  type    = "TXT"
  name    = "_dmarc"
  content = "v=DMARC1; p=quarantine;"
}