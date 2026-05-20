# Policy allowing lambda to assume permissions
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

# IAM role for Lambda execution
data "aws_iam_policy_document" "lambda_permissions" {
  statement {
    sid    = "db"
    effect = "Allow"
    actions = [
      "dynamodb:DeleteItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem"
    ]
    resources = [aws_dynamodb_table.subscribers_table.arn]
  }

  statement {
    sid    = "email"
    effect = "Allow"
    actions = [
      "ses:SendTemplatedEmail",
      "ses:SendBulkTemplatedEmail"
    ]
    resources = ["*"]

    condition {
      test     = "StringLike"
      variable = "ses:FromAddress"

      values = [
        "*@sb-soft.com"
      ]
    }
  }
}

resource "aws_iam_role" "newsletter_lambda_execution_role" {
  name               = "newsletter_lambda_execution_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

# Attach cloudwatch permissions to the role
resource "aws_iam_role_policy_attachment" "cloudwatch_policy" {
  role       = aws_iam_role.newsletter_lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Attach the lambda permissions to the role
resource "aws_iam_role_policy" "newsletter_policy" {
  name   = "newsletter_policy"
  role   = aws_iam_role.newsletter_lambda_execution_role.id
  policy = data.aws_iam_policy_document.lambda_permissions.json
}

# Package the Lambda function code
data "archive_file" "newsletter_code" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/dist"
  output_path = "${path.module}/../lambda/function.zip"
}

# Lambda functions
resource "aws_lambda_function" "sub_function" {
  filename      = data.archive_file.newsletter_code.output_path
  function_name = "sb_site_newsletter_sub"
  role          = aws_iam_role.newsletter_lambda_execution_role.arn
  handler       = "handlers/sub.handler"
  runtime       = "nodejs22.x"
}

resource "aws_lambda_function" "sub_confirm_function" {
  filename      = data.archive_file.newsletter_code.output_path
  function_name = "sb_site_newsletter_sub_confirm"
  role          = aws_iam_role.newsletter_lambda_execution_role.arn
  handler       = "handlers/subConfirm.handler"

  runtime = "nodejs22.x"
}

resource "aws_lambda_function" "unsub_function" {
  filename      = data.archive_file.newsletter_code.output_path
  function_name = "sb_site_newsletter_unsub"
  role          = aws_iam_role.newsletter_lambda_execution_role.arn
  handler       = "handlers/unsub.handler"

  runtime = "nodejs22.x"
}

resource "aws_lambda_function" "unsub_confirm_function" {
  filename      = data.archive_file.newsletter_code.output_path
  function_name = "sb_site_newsletter_unsub_confirm"
  role          = aws_iam_role.newsletter_lambda_execution_role.arn
  handler       = "handlers/unsubConfirm.handler"

  runtime = "nodejs22.x"
}

# -- API Gateway --
resource "aws_apigatewayv2_api" "api" {
  name          = "newsletter-api"
  protocol_type = "HTTP"
  cors_configuration {
    # TODO this probably shouldn't be hardcoded
    allow_origins = [
      "https://www.sbox-soft.com",
      "https://sbox-soft.com"
    ]
    allow_methods = [
      "POST",
      "OPTIONS"
    ]
    allow_headers = ["*"]
    max_age       = 300
  }
}


# Lambda permissions to api gateway
resource "aws_lambda_permission" "sub_allow_api_gateway" {
  statement_id  = "SubAllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.sub_function.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "sub_confirm_allow_api_gateway" {
  statement_id  = "SubConfirmAllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.sub_confirm_function.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "unsub_allow_api_gateway" {
  statement_id  = "UnsubAllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.unsub_function.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "unsub_confirm_allow_api_gateway" {
  statement_id  = "UnsubConfirmAllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.unsub_confirm_function.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# Lambda integrations
resource "aws_apigatewayv2_integration" "sub" {
  api_id = aws_apigatewayv2_api.api.id

  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.sub_function.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "sub_confirm" {
  api_id = aws_apigatewayv2_api.api.id

  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.sub_confirm_function.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "unsub" {
  api_id = aws_apigatewayv2_api.api.id

  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.unsub_function.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "unsub_confirm" {
  api_id = aws_apigatewayv2_api.api.id

  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.unsub_confirm_function.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

# Routes that target those integrations
resource "aws_apigatewayv2_route" "sub" {
  api_id = aws_apigatewayv2_api.api.id

  route_key = "POST /subscribe"

  target = "integrations/${aws_apigatewayv2_integration.sub.id}"
}

resource "aws_apigatewayv2_route" "sub_confirm" {
  api_id = aws_apigatewayv2_api.api.id

  route_key = "GET /subscribe-confirm"

  target = "integrations/${aws_apigatewayv2_integration.sub_confirm.id}"
}

resource "aws_apigatewayv2_route" "unsub" {
  api_id = aws_apigatewayv2_api.api.id

  route_key = "POST /unsubscribe"

  target = "integrations/${aws_apigatewayv2_integration.unsub.id}"
}

resource "aws_apigatewayv2_route" "unsub_confirm" {
  api_id = aws_apigatewayv2_api.api.id

  route_key = "GET /unsubscribe-confirm"

  target = "integrations/${aws_apigatewayv2_integration.unsub_confirm.id}"
}

# Automatic deployment stage
resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

# Domain crap

resource "aws_acm_certificate" "api_cert" {
  domain_name       = "api.sbox-soft.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "cloudflare_dns_record" "api_cert" {
  for_each = {
    for dvo in aws_acm_certificate.api_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  zone_id = data.cloudflare_zone.main.zone_id
  name    = each.value.name
  ttl     = 60
  content = each.value.record
  type    = each.value.type
}

resource "aws_acm_certificate_validation" "api_cert" {
  certificate_arn = aws_acm_certificate.api_cert.arn
  validation_record_fqdns = [
    for dvo in aws_acm_certificate.api_cert.domain_validation_options : dvo.resource_record_name
  ]
}

resource "aws_apigatewayv2_domain_name" "api_domain" {
  domain_name = "api.sbox-soft.com"

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.api_cert.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

# Mapping of api/domainname/stage
resource "aws_apigatewayv2_api_mapping" "api_mapping" {
  api_id      = aws_apigatewayv2_api.api.id
  domain_name = aws_apigatewayv2_domain_name.api_domain.id
  stage       = aws_apigatewayv2_stage.prod.id
}

# DNS record to point api to cloudflare
resource "cloudflare_dns_record" "api" {
  zone_id = data.cloudflare_zone.main.zone_id
  name    = "api"
  type    = "CNAME"
  content = aws_apigatewayv2_domain_name.api_domain.domain_name_configuration[0].target_domain_name
  ttl     = 3600
  proxied = false
}