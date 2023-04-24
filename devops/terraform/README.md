## Manual deployment 

To run this in your local computer, you must create the following files:
- backend_config.hcl - File that contains secrets to access DigitalOcean Space that has terraform backend.
    ```
        access_key=""
        secret_key=""
    ```
- terraform.tfvars - File that contains DigitalOcean token to access the resources.
    ```
        do_token = ""
    ```

make init
make plan
make apply
make version
make destroy