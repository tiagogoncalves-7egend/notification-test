FROM registry.gitlab.com/7egend/projects/home/docker/ansible:latest

# -------------------------------------
# Install roles and collections
# -------------------------------------
WORKDIR /ansible
COPY requirements.yaml .

# NOTE:
# Collections and roles must be installed in two separate steps,
# as described by Ansible documentation:
# 
# "Installing both roles and collections from the same requirements file will
# not work when specifying a custom collection or role install path. In this
# scenario the collections will be skipped and the command will process each
# like ansible-galaxy role install would."
# 
# https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-a-collection-from-galaxy
RUN --mount=type=ssh,required=true \
    ansible-galaxy collection install -r requirements.yaml && \
    ansible-galaxy role install -r requirements.yaml

# -------------------------------------
# Copy sources and playbooks
# -------------------------------------
COPY group_vars ./group_vars
COPY host_vars ./host_vars
COPY playbooks ./playbooks
COPY roles ./roles
COPY ansible.cfg .
COPY hosts.yaml .

RUN chmod u=rx,go= ansible.cfg

RUN pip3 install PyMySQL
RUN apk add mysql-client

ARG BUILD_SOURCE_REF_NAME
RUN echo $BUILD_SOURCE_REF_NAME >> /usr/share/git_tag
