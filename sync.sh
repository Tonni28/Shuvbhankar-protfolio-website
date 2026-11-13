yarn build
HOST=57.131.32.68
USER=hoshonto
SRC=dist/
DEST=/home/hoshonto/shubhankar/profile/
IDENTITY_FILE=~/.ssh/hoshonto

if [ ! -f "$IDENTITY_FILE" ]; then
    echo "Identity file $IDENTITY_FILE not found!"
    exit 1
fi
# Run test.sh and exit if it fails
# bash test.sh
# if [ $? -ne 0 ]; then
#     echo "Tests failed. Aborting sync."
#     exit 1
# fi

# Upload from $SRC to $DEST
rsync -avz -e "ssh -i $IDENTITY_FILE" "$SRC" "$USER@$HOST:$DEST"