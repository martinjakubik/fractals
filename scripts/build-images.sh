#!/bin/bash

if [[ ! -d app ]] ; then
    mkdir app
fi

image_filenames=("fractals-icon" "fractals-logo")

inkscape_command=inkscape

for image_filename in "${image_filenames[@]}" ; do
    inkscape_command+=" resources/${image_filename}.svg"
done

if [[ -n $image_filenames ]] ; then
    inkscape_command+=" -j -C --export-type png"
    echo -n $inkscape_command
    eval $inkscape_command
    echo
fi

image_filenames=()

for image_filename in "${image_filenames[@]}" ; do
    inkscape_command="inkscape resources/${image_filename}"
    if [[ -n $image_filenames ]] ; then
        inkscape_command+=" -j -C --export-type png"
        echo -n $inkscape_command
        eval $inkscape_command
    fi
done
