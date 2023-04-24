# Encrypt files.
enc: action = encrypt
enc: transform

# Decrypt files.
dec: action = decrypt
dec: transform
dec: protect-vault

# -------------------------------------
# When you decrypt vault files, ensure
# your git directory is protected against
# pushing decrypted vault files
# -------------------------------------
protect-vault:
	@cp -i "$(shell pwd)/bin/pre-commit" "$(shell pwd)/.git/hooks/pre-commit" || echo "[INFO] Skipped vault protection";

# -------------------------------------
# Applies the encrypt / decrypt action
# for all password protected files.
# -------------------------------------
transform:
	@[ "${action}" ] || ( echo "Undefined action"; exit 1; )
	@echo "Affected files:" && \
		ls **/*/vault.yaml && \
		echo ""
	@ansible-vault ${action} **/*/vault.yaml

# -------------------------------------
# Creates a docker image and runs a
# fresh new container ready to run
# playbooks.
#
# You need to run ssh-add before if not already!
# -------------------------------------
ansible: image ?= notification-hub/ansible
ansible:
	docker build --ssh default -t ${image} . 
	docker run -it --rm \
		-v "$(shell pwd)":/ansible \
		-v /run/host-services/ssh-auth.sock:/ssh-agent \
		-e SSH_AUTH_SOCK="/ssh-agent" \
		${image} bash
