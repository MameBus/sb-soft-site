resource "aws_ses_template" "sub_verify" {
  name    = "SubscribeVerify"
  subject = "Please Verify Your Subscription to SBox-Soft"
  html    = file("../email-templates/sub-verify/sub-verify.html")
  text    = file("../email-templates/sub-verify/sub-verify.txt")
}

resource "aws_ses_template" "sub_confirm" {
  name    = "SubscribeConfirm"
  subject = "SBox-Soft Subscription Confirmed"
  html    = file("../email-templates/sub-confirm/sub-confirm.html")
  text    = file("../email-templates/sub-confirm/sub-confirm.txt")
}

resource "aws_ses_template" "unsub_verify" {
  name    = "UnsubscribeVerify"
  subject = "Please Verify The Canellation of Your SBox-Soft Subscription"
  html    = file("../email-templates/unsub-verify/unsub-verify.html")
  text    = file("../email-templates/unsub-verify/unsub-verify.txt")
}

resource "aws_ses_template" "sub_confirm" {
  name    = "UnsubscribeConfirm"
  subject = "SBox-Soft Subscription Cancellation Confirmed"
  html    = file("../email-templates/unsub-confirm/unsub-confirm.html")
  text    = file("../email-templates/unsub-confirm/unsub-confirm.txt")
}