#!/bin/bash
# Ensure FOLLY_CFG_NO_COROUTINES=1 is set in all Pod target xcconfig files
# to prevent 'folly/experimental/coro/Coroutine.h' file not found errors.
# The coroutine headers are not shipped with the ReactNativeDependencies xcframework,
# but C++20 mode causes FOLLY_HAS_COROUTINES to be set to 1 unless this flag is defined.

find Pods/Target\ Support\ Files -name "*.xcconfig" | while read -r file; do
  if grep -q "OTHER_CPLUSPLUSFLAGS" "$file" && ! grep -q "FOLLY_CFG_NO_COROUTINES" "$file"; then
    sed -i '' 's/OTHER_CPLUSPLUSFLAGS = $(inherited)/OTHER_CPLUSPLUSFLAGS = $(inherited) -DFOLLY_CFG_NO_COROUTINES=1/' "$file"
  fi
done
