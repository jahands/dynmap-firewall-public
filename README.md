# dynmap-firewall

This redacts (or optionally blocks) access to a Dynmap server from players who are not on the allowed ASN list. That way I can make the map public, but not let the whole world see what players are online (for privacy.)

Demo at https://dynmap.geostyx.com

Dynmap is a mapping plugin for Minecraft (forge/spigot/bukkit/etc):
https://github.com/webbukkit/dynmap

I recommend setting the following in your dynmap config (usually `dynmap/configuration.txt`):
```
defaulttilescale: 2
deftemplatesuffix: hires
storage:
  # Filetree storage (standard tree of image files for maps)
  type: filetree
```
