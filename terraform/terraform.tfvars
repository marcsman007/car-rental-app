app_name             = "car-rental-app"
aws_region           = "ap-southeast-1"
availability_zone    = "ap-southeast-1a"
ec2_instance_type    = "t3.micro"
key_pair_name        = "app-keypair"                   # Must exist in AWS or will be created
public_key_path      = "/home/mjmacaburas/app-keypair.pub"  # Path to your local public key
