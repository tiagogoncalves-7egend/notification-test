# ---------------------------------------------
# Notification Hub
# ---------------------------------------------
resource "digitalocean_droplet" "notification_hub" {
  ipv6               = "false"
  image              = "ubuntu-22-04-x64"
  monitoring         = "true"
  name               = "notification-hub"
  region             = "lon1"
  size               = "s-1vcpu-1gb"
  resize_disk        = "false"
  tags               = ["devops","notification-hub"]
  vpc_uuid           = "beb77ac3-dc82-11e8-83ec-3cfdfea9f3f0" # default-lon1
  ssh_keys = [var.digitalocean_ssh_tiago_goncalves,
    var.digitalocean_ssh_tiago_barros,
    var.digitalocean_ssh_pedro_simeao,
    var.digitalocean_ssh_jose_vieira
  ]
}