# Adds a Debug-only "Start Metro (auto)" shell-script build phase to the
# CarAppClean target so running from Xcode brings Metro up automatically.
# Idempotent: re-running does nothing if the phase already exists.
require 'xcodeproj'

PROJECT = File.expand_path('../../CarAppClean.xcodeproj', __FILE__)
TARGET_NAME = 'CarAppClean'
PHASE_NAME = 'Start Metro (auto)'

SCRIPT = <<~SH
  # Auto-start Metro when running from Xcode (Debug builds only).
  if [ "$CONFIGURATION" = "Debug" ]; then
    export RCT_METRO_PORT="${RCT_METRO_PORT:=8081}"
    if nc -w 2 -z localhost "${RCT_METRO_PORT}" 2>/dev/null; then
      echo "note: Metro already running on port ${RCT_METRO_PORT}"
    else
      open "$SRCROOT/scripts/launchMetro.command"
    fi
  fi
SH

project = Xcodeproj::Project.open(PROJECT)
target = project.targets.find { |t| t.name == TARGET_NAME }
raise "Target #{TARGET_NAME} not found" unless target

if target.shell_script_build_phases.any? { |p| p.name == PHASE_NAME }
  puts "Phase '#{PHASE_NAME}' already present — nothing to do."
else
  phase = target.new_shell_script_build_phase(PHASE_NAME)
  phase.shell_script = SCRIPT
  phase.shell_path = '/bin/sh'
  # Run on every build (don't skip via dependency analysis).
  phase.always_out_of_date = '1'
  # Move it to the front so Metro starts before compile/link.
  target.build_phases.unshift(target.build_phases.delete(phase))
  project.save
  puts "Added '#{PHASE_NAME}' as the first build phase of #{TARGET_NAME}."
end
