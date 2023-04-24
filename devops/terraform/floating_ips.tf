resource "digitalocean_reserved_ip" "notification_hub_reserved_ip" {
  region = "lon1"
}

resource "digitalocean_reserved_ip_assignment" "notification_hub_reserved_ip_assignment" {
  ip_address = digitalocean_reserved_ip.notification_hub_reserved_ip.ip_address
  droplet_id = digitalocean_droplet.notification_hub.id
}