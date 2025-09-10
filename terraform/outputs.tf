output "ec2_public_ip" {
  description = "The public IP address of the EC2 instance"
  value       = aws_instance.app.public_ip
}

output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "subnet_id" {
  description = "The ID of the public subnet"
  value       = aws_subnet.public.id
}
