#!/bin/bash
# Server details
SERVER_ALIAS="metagame-server-dev"  # Replace with the alias from your SSH config
# Example: If your SSH config has "Host myserver" then SERVER_ALIAS="myserver"

# Output file
OUTPUT_FILE="deploy_log.txt"


# Local code directories and their corresponding destination directories on the server
FILES=(
    "common:/home/ubuntu/platform/server"
    "core:/home/ubuntu/platform/server"
    "docs:/home/ubuntu/platform/server"
    "events:/home/ubuntu/platform/server"
    "kyc:/home/ubuntu/platform/server"
    "notifications:/home/ubuntu/platform/server"
    "payment:/home/ubuntu/platform/server"
    "upload:/home/ubuntu/platform/server"
    "wallet:/home/ubuntu/platform/server"
    "affiliate:/home/ubuntu/platform/server"


)
# FILES=(
#     "bo-server/affiliate:/home/ubuntu/backoffice/server/"
# )

# Single file to copy
SINGLE_FILE="package.json"
SINGLE_DESTINATION="/home/ubuntu/platform/server"

# Redirect stdout and stderr to both terminal and output file
exec > >(tee -a "$OUTPUT_FILE") 2>&1

echo "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<dev-deply-platform>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
echo "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< $(date +"%m-%d-%Y %T") $1 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"  # Prepend timestamp to log message
echo  # Add a line space

# Build bo-server
echo "Building bo-server..."
# cd ./bo-server || { echo "Error: bo-server directory not found."; exit 1; }
if ! yarn run build; then
    echo "Error: Failed to build bo-server."
    exit 1
fi




# SSH connection command
SSH_COMMAND="ssh $SERVER_ALIAS"  # This assumes SSH config contains all necessary details

# Copy single file to server
echo "Copying $SINGLE_FILE to $SERVER_ALIAS:$SINGLE_DESTINATION..."
scp $SINGLE_FILE $SERVER_ALIAS:$SINGLE_DESTINATION || { echo "Error: Failed to copy $SINGLE_FILE."; exit 1; }

echo "All files copied to the server."


# Copy each file to its corresponding destination on the server
for FILE in "${FILES[@]}"
do
    # Split the file and destination directory
    IFS=':' read -r -a FILE_INFO <<< "$FILE"
    LOCAL_DIR="${FILE_INFO[0]}"
    DESTINATION_DIR="${FILE_INFO[1]}"

    # Copy file to server
    echo "Copying scp -r $LOCAL_DIR $SERVER_ALIAS:$DESTINATION_DIR"
    scp -r $LOCAL_DIR $SERVER_ALIAS:$DESTINATION_DIR || { echo "Error: Failed to copy $LOCAL_DIR."; exit 1; }

    echo "File $LOCAL_DIR copied to $SERVER_ALIAS:$DESTINATION_DIR."
done

echo "All files copied to the server."


ssh $SERVER_ALIAS << EOF
    # Change directory to the server directory
    cd /home/ubuntu/platform/server
    
    # Build the project
    export PATH="$PATH:/home/ubuntu/.nvm/versions/node/v20.12.2/bin"

    echo "Building the project..."
    yarn run build || { echo "Error: Failed to build the project."; exit 1; }
    
    # Stop the existing PM2 process
    echo "Stopping PM2 process..."
    # pm2 stop server

    # Start the PM2 process
    echo "Starting PM2 process..."
    yarn pm2

    # Exit from the server
    exit
EOF

echo "Platform deploy sucessfully."