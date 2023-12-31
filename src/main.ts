import * as core from '@actions/core'
import { Version } from './version'

export async function run() {
  const manifestPath: string = core.getInput('manifest-path')
  const ref: string = core.getInput('ref')
  const useVersion: string = core.getInput('use-version')
  const workspace: string = core.getInput('workspace')

  if (
    (manifestPath === '' && useVersion === '') ||
    (manifestPath !== '' && useVersion !== '')
  ) {
    core.setFailed('Must provide manifest-path OR use-version')
    return
  }

  core.info('Running action with inputs:')
  core.info(`\tRef: ${ref}`)
  if (manifestPath !== '') core.info(`\tManifest Path: ${manifestPath}`)
  if (useVersion !== '') core.info(`\tUse Version: ${useVersion}`)
  if (workspace !== '') core.info(`\tWorkspace: ${workspace}`)

  // Get version from input string, or infer it from the workspace
  const version: Version | undefined = useVersion
    ? new Version(useVersion)
    : Version.infer(manifestPath, workspace)

  if (version === undefined) {
    core.setFailed('Could not infer version')
    return
  }

  core.info(`Inferred Version: ${version.toString()}`)
  core.info(`Tagging ${ref} with version ${version.toString()}`)

  // Tag and push the version in the workspace
  await version.tag(ref, workspace)

  core.info('Tagging complete')

  // Output the various version formats
  // [X.Y.Z-PRE, X.Y.Z, X.Y, X, Y, Z, PRE]
  core.setOutput('version', version.toString(false))
  core.setOutput(
    'major-minor-patch',
    `${version.major}.${version.minor}.${version.patch}`
  )
  core.setOutput('major-minor', `${version.major}.${version.minor}`)
  core.setOutput('major', version.major)
  core.setOutput('minor', version.minor)
  core.setOutput('patch', version.patch)
  core.setOutput('prerelease', version.prerelease)
}
