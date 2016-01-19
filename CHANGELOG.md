# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).
All 0.x releases are considered Pre-Release and therefor may contain breaking changes.
Once 1.x is released, all breaking changes will bump the Major version to adhere to SemVer.

## [Unreleased]

## [0.5.0]
- Added support for nested expressions in any position that would accept a VALUE
- Added resolvers to help with scope resolution and value resolution
- Added validators to help with checking elements for syntax errors (incomplete)

## [0.4.0]
- Added support for new concept "Conjunctions".
- Added generic "End" action for all core Actions.
- Added errors.md for better error message explanation.
- Change error messages to include an error code.

## [0.3.0]
BREAKING CHANGES
- Completely new Lexer / Parser implementation
- Simplified SQiggL's syntax from using double braces `{{ }}` to now single braces `{ }`