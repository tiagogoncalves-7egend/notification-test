resource "digitalocean_firewall" "notification-hub-fw" {
  tags = ["notification-hub"]
  name = "notification-hub-fw"

  inbound_rule {
    port_range       = "22"
    protocol         = "tcp"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    port_range       = "80"
    protocol         = "tcp"
    source_addresses = ["0.0.0.0/0"]
  }

  inbound_rule {
    port_range       = "443"
    protocol         = "tcp"
    source_addresses = ["0.0.0.0/0"]
  }

  outbound_rule {
    destination_addresses = ["0.0.0.0/0", "::/0"]
    port_range            = "all"
    protocol              = "tcp"
  }

  outbound_rule {
    destination_addresses = ["0.0.0.0/0", "::/0"]
    protocol              = "icmp"
  }

  outbound_rule {
    destination_addresses = ["0.0.0.0/0", "::/0"]
    port_range            = "all"
    protocol              = "udp"
  }
}
