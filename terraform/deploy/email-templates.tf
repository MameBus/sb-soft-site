resource "aws_ses_template" "sub_verify" {
  name    = "SubscribeVerify"
  subject = "Please Verify Your Subscription to SBox-Soft"
  html    = file("${path.module}/../../email-templates/sub-verify/sub-verify.html")
  text    = file("${path.module}/../../email-templates/sub-verify/sub-verify.txt")
}

resource "aws_ses_template" "sub_confirm" {
  name    = "SubscribeConfirm"
  subject = "SBox-Soft Subscription Confirmed"
  html    = file("${path.module}/../../email-templates/sub-confirmation/sub-confirmation.html")
  text    = file("${path.module}/../../email-templates/sub-confirmation/sub-confirmation.txt")
}

resource "aws_ses_template" "unsub_verify" {
  name    = "UnsubscribeVerify"
  subject = "Please Verify The Canellation of Your SBox-Soft Subscription"
  html    = file("${path.module}/../../email-templates/unsub-verify/unsub-verify.html")
  text    = file("${path.module}/../../email-templates/unsub-verify/unsub-verify.txt")
}

resource "aws_ses_template" "unsub_confirm" {
  name    = "UnsubscribeConfirm"
  subject = "SBox-Soft Subscription Cancellation Confirmed"
  html    = file("${path.module}/../../email-templates/unsub-confirmation/unsub-confirmation.html")
  text    = file("${path.module}/../../email-templates/unsub-confirmation/unsub-confirmation.txt")
}

resource "aws_ses_template" "new_devlog" {
  name    = "NewDevlog"
  subject = "A New SBox-Soft Devlog Just Dropped"
  html    = file("${path.module}/../../email-templates/new-devlog/new-devlog.html")
  text    = file("${path.module}/../../email-templates/new-devlog/new-devlog.txt")
}