{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs-18_x
    npm
  ];
  
  shellHook = ''
    export NODE_OPTIONS="--max-old-space-size=4096"
  '';
}