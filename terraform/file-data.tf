# Terraform for setting up a dynamo db table that contains the current state of the published pages used to inform whether to send out email notifications

resource "aws_dynamodb_table" "pages_table" {
  name         = "site-published-pages"
  billing_mode = "PAY_PER_REQUEST" # May need to revist
  hash_key     = "pageName"

  attribute {
    name = "pageName"
    type = "S"
  }
}