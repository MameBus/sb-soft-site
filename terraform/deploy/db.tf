# The table used to track who is subscribed to the newsletter service
resource "aws_dynamodb_table" "subscribers_table" {
  name         = "site-newsletter-subscribers"
  billing_mode = "PAY_PER_REQUEST" # May need to revist
  hash_key     = "emailAddress"

  attribute {
    name = "emailAddress"
    type = "S"
  }

  attribute {
    name = "verifiedStatus"
    type = "S"
  }

  global_secondary_index {
    name               = "VerifiedStatusIndex"
    hash_key           = "verifiedStatus"
    projection_type    = "INCLUDE"
    non_key_attributes = ["emailAddress"]
  }
}