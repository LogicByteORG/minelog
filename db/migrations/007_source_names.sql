update public.logs
set source = case source
  when 'web'          then 'minelog.org'
  when 'modrinth-app' then 'Modrinth App'
  when 'prism'        then 'Prism Launcher'
  when 'multimc'      then 'MultiMC'
  when 'curseforge'   then 'CurseForge'
  when 'atlauncher'   then 'ATLauncher'
  when 'gdlauncher'   then 'GDLauncher'
  when 'minecraft'    then 'Minecraft Launcher'
  when 'lunar'        then 'Lunar Client'
  when 'badlion'      then 'Badlion Client'
  when 'feather'      then 'Feather Client'
  else source
end
where source in (
  'web', 'modrinth-app', 'prism', 'multimc', 'curseforge', 'atlauncher',
  'gdlauncher', 'minecraft', 'lunar', 'badlion', 'feather'
);

