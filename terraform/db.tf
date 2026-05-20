# The table used to track who is subscribed to the newsletter service
resource "aws_dynamodb_table" "subscribers_table" {
  name           = "site-newsletter-subscribers"
  billing_mode   = "PAY_PER_REQUEST" # May need to revist
  hash_key       = "emailAddress"
  range_key      = "verifiedStatus"

  attribute {
    name = "emailAddress"
    type = "S"
  }

  attribute {
    name = "verifiedStatus"
    type = "S"
  }
}

# Index for searching by the verifiedStatus sort key
resource "aws_dynamodb_global_secondary_index" "verified_index" {
    table_name = aws_dynamodb_table.subscribers_table.name
    index_name = "VerifiedStatusIndex"

    projection {
        projection_type    = "INCLUDE"
        non_key_attributes = ["emailAddress"]
    }

    key_schema {
        attribute_name = "verifiedStatus"
        attribute_type = "S"
        key_type       = "HASH"
    }
}