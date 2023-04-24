tf_version=1.3.6

# --------------------------------------------------------------------
# Lists all placeholders that were not automatically replaced.
# --------------------------------------------------------------------
missing-values: filename ?= backend_config.hcl terraform.tfvars
missing-values:
	@cat ${filename} | grep -oE "<.+>" | sort | uniq -u

init: 
	docker run -it --rm \
	-v "$(shell pwd)":/terraform \
	hashicorp/terraform:$(tf_version) -chdir=/terraform init -backend-config=/terraform/backend_config.hcl

plan: 
	docker run -it --rm \
	-v "$(shell pwd)":/terraform \
	hashicorp/terraform:$(tf_version) -chdir=/terraform plan

apply: 
	docker run -it --rm \
	-v "$(shell pwd)":/terraform \
	hashicorp/terraform:$(tf_version) -chdir=/terraform apply

refresh: 
	docker run -it --rm \
	-v "$(shell pwd)":/terraform \
	hashicorp/terraform:$(tf_version) -chdir=/terraform refresh

version: 
	docker run -it --rm \
	-v "$(shell pwd)":/terraform \
	hashicorp/terraform:$(tf_version) -chdir=/terraform version

destroy: 
	docker run -it --rm \
	-v "$(shell pwd)":/terraform \
	hashicorp/terraform:$(tf_version) -chdir=/terraform destroy