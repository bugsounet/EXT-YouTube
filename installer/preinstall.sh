#!/bin/bash
# +----------------+
# | npm preinstall |
# +----------------+

# get the installer directory
Installer_get_current_dir () {
  SOURCE="${BASH_SOURCE[0]}"
  while [ -h "$SOURCE" ]; do
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
  done
  echo "$( cd -P "$( dirname "$SOURCE" )" && pwd )"
}

Installer_dir="$(Installer_get_current_dir)"

# move to installler directory
cd "$Installer_dir"
source utils.sh

# module name
Installer_module="MMM-YouTube"

echo

# Let's start !
Installer_info "Welcome to $Installer_module"

echo

# Check not run as root
Installer_info "No root checking..."
if [ "$EUID" -eq 0 ]; then
  Installer_error "npm install must not be used as root"
  exit 255
fi
Installer_chk "$(pwd)/../" "MMM-YouTube"
Installer_chk "$(pwd)/../../../" "MagicMirror"
echo

# switch branch
Installer_info "Installing Sources..."
git checkout -f master 2>/dev/null || Installer_error "Installing Error !"
git pull 2>/dev/null || Installer_error "Installing Error !"

echo
Installer_info "Installing all npm libraries..."
cd ..
