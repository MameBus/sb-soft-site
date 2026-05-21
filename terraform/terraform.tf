terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.46"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.19"
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
