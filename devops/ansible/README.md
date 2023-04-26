# Ansible for Notification Hub

This repository contains Ansible playbooks for configuring a Notification Hub. The playbooks include:

1. **gateway**: This playbook configures a gateway server that routes incoming notifications to the Notification Hub.
2. **notification-hub**: This playbook configures the Notification Hub itself, including setting up any necessary components and message queues.
3. **provisioning**: This playbook provisions the necessary infrastructure for the Notification Hub.

## Usage

To use these playbooks, you'll need to have Ansible installed on your machine. You can then run the playbooks using the `ansible-playbook` command. 
You can also run the playbooks inside a container with the image of this repository by using  `make ansible` command.

For example, to deploy the notification-hub, you would run:

    ansible-playbook playbooks/notification-hub/deploy.yaml

You can customize the behavior of the playbooks by modifying the variables in the `group_vars/all` directory.  

