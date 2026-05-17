terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.92"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5"
    }
  }

  backend "s3" {
    bucket = "sbox-soft-terraform-state"
    key    = "sbox-site/terraform.tfstate"
    region = "us-east-1"

    use_lockfile = true
  }

  required_version = ">= 1.2"
}
