terraform {
  backend "s3" {
    endpoint = "fra1.digitaloceanspaces.com"
    region   = "us-west-1"                     // Region key is set to a known s3 region, which will effectively be ignored
    bucket   = "7egend-terraform-states"       // Space name
    key      = "notification-hub.tfstate"      // File name that will store de state
    skip_metadata_api_check     = true
    skip_credentials_validation = true
  }
}
