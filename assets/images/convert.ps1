Get-ChildItem -Path "." -Recurse -Filter *.png |

Foreach-Object {

$input=$_.FullName
# ../convert.exe $input -resize 300x300 -background transparent -gravity South -extent 300x300 $input

}
