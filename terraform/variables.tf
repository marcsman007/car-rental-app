variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "ap-southeast-1"
}

variable "availability_zone" {
  description = "The availability zone to deploy resources in"
  type        = string
  default     = "ap-southeast-1a"
}

variable "ec2_instance_type" {
  description = "The type of EC2 instance to use"
  type        = string
  default     = "t3.micro"
}

variable "key_pair_name" {
  description = "The name of the existing AWS key pair to use for EC2 instances"
  type        = string
  default     = "app-keypair"
}

variable "public_key_path" {
  description = "The path to the public key file for the AWS key pair"
  type        = string
  default     = "~/.ssh/app-keypair.pub"
}

variable "app_name" {
  description = "Application name for tagging"
  type        = string
  default     = "car-rental-app"
}
