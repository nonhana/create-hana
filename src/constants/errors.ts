export const ERROR_MESSAGES = {
  VALIDATION: {
    PROJECT_TYPE_REQUIRED: 'Project type is required to continue',
    TARGET_DIR_REQUIRED: 'Project target directory is required',
    TARGET_DIR_EXISTS: 'Project target directory already exists',
    TARGET_DIR_EMPTY: 'Project name cannot be empty',
    INVALID_PROJECT_TYPE: 'Unsupported project type: {projectType}',
    INVALID_LANGUAGE: 'Invalid language selection: {language}',
    INVALID_PACKAGE_MANAGER: 'Invalid package manager: {packageManager}',
    INVALID_BUNDLER: 'Invalid bundler selection: {bundler}',
    INVALID_CODE_QUALITY_TOOL: 'Invalid code quality tool: {tool}',
  },

  FILE_SYSTEM: {
    FAILED_TO_CREATE_DIR: 'Failed to create directory: {path}',
    FAILED_TO_WRITE_FILE: 'Failed to write file: {path}',
    FAILED_TO_READ_FILE: 'Failed to read file: {path}',
    FAILED_TO_READ_TEMPLATE: 'Failed to read template file: {path}',
    FAILED_TO_REMOVE_DIR: 'Failed to remove directory: {path}',
    PERMISSION_DENIED: 'Permission denied accessing: {path}',
    PATH_NOT_EXISTS: 'Path does not exist: {path}',
    PATH_ALREADY_EXISTS: 'Path already exists: {path}',
  },

  DEPENDENCY: {
    INSTALL_FAILED: 'Failed to install dependencies with {packageManager}',
    PACKAGE_MANAGER_NOT_FOUND: 'Package manager not found: {packageManager}',
    DEPENDENCY_CONFLICT: 'Dependency conflict detected: {dependency}',
    INVALID_VERSION: 'Invalid version specified for {dependency}: {version}',
  },

  NETWORK: {
    CONNECTION_FAILED: 'Network connection failed',
    TIMEOUT: 'Network request timed out',
    DOWNLOAD_FAILED: 'Failed to download: {url}',
    REGISTRY_UNAVAILABLE: 'Package registry is unavailable',
  },

  CONFIGURATION: {
    INVALID_CONFIG: 'Invalid configuration provided',
    MISSING_CONFIG_FIELD: 'Missing required configuration field: {field}',
    CONFIG_PARSE_ERROR: 'Failed to parse configuration file: {path}',
    INCOMPATIBLE_OPTIONS: 'Incompatible configuration options: {options}',
  },

  USER_INPUT: {
    OPERATION_CANCELLED: 'Operation was cancelled by user',
    INVALID_INPUT: 'Invalid input provided: {input}',
    INPUT_REQUIRED: 'Input is required for: {field}',
    INPUT_TOO_LONG: 'Input is too long for field: {field}',
    INPUT_TOO_SHORT: 'Input is too short for field: {field}',
  },

  SYSTEM: {
    UNEXPECTED_ERROR: 'An unexpected error occurred',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform operation',
    DISK_SPACE_FULL: 'Insufficient disk space',
    MEMORY_ERROR: 'Out of memory',
    PROCESS_FAILED: 'Process execution failed: {process}',
  },

  GENERATOR: {
    GENERATOR_FAILED: 'Generator failed: {generator}',
    TEMPLATE_NOT_FOUND: 'Template not found: {template}',
    TEMPLATE_RENDER_ERROR: 'Template rendering failed: {template}',
    MISSING_GENERATOR: 'No generator found for: {type}',
  },

  GIT: {
    INIT_FAILED: 'Failed to initialize Git repository',
    GIT_NOT_FOUND: 'Git is not installed or not found in PATH',
    REPO_ALREADY_EXISTS: 'Git repository already exists',
  },
} as const

export function formatErrorMessage(
  message: string,
  variables: Record<string, string | number> = {},
): string {
  return Object.entries(variables).reduce(
    (msg, [key, value]) => msg.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    message,
  )
}

export const ErrorMessages = {
  validation: {
    projectTypeRequired: () => ERROR_MESSAGES.VALIDATION.PROJECT_TYPE_REQUIRED,
    targetDirRequired: () => ERROR_MESSAGES.VALIDATION.TARGET_DIR_REQUIRED,
    targetDirExists: () => ERROR_MESSAGES.VALIDATION.TARGET_DIR_EXISTS,
    targetDirEmpty: () => ERROR_MESSAGES.VALIDATION.TARGET_DIR_EMPTY,
    invalidProjectType: (projectType: string) =>
      formatErrorMessage(ERROR_MESSAGES.VALIDATION.INVALID_PROJECT_TYPE, { projectType }),
    invalidLanguage: (language: string) =>
      formatErrorMessage(ERROR_MESSAGES.VALIDATION.INVALID_LANGUAGE, { language }),
    invalidPackageManager: (packageManager: string) =>
      formatErrorMessage(ERROR_MESSAGES.VALIDATION.INVALID_PACKAGE_MANAGER, { packageManager }),
    invalidBundler: (bundler: string) =>
      formatErrorMessage(ERROR_MESSAGES.VALIDATION.INVALID_BUNDLER, { bundler }),
    invalidCodeQualityTool: (tool: string) =>
      formatErrorMessage(ERROR_MESSAGES.VALIDATION.INVALID_CODE_QUALITY_TOOL, { tool }),
  },

  fileSystem: {
    failedToCreateDir: (path: string) =>
      formatErrorMessage(ERROR_MESSAGES.FILE_SYSTEM.FAILED_TO_CREATE_DIR, { path }),
    failedToWriteFile: (path: string) =>
      formatErrorMessage(ERROR_MESSAGES.FILE_SYSTEM.FAILED_TO_WRITE_FILE, { path }),
    failedToReadFile: (path: string) =>
      formatErrorMessage(ERROR_MESSAGES.FILE_SYSTEM.FAILED_TO_READ_FILE, { path }),
    failedToReadTemplate: (path: string) =>
      formatErrorMessage(ERROR_MESSAGES.FILE_SYSTEM.FAILED_TO_READ_TEMPLATE, { path }),
    failedToRemoveDir: (path: string) =>
      formatErrorMessage(ERROR_MESSAGES.FILE_SYSTEM.FAILED_TO_REMOVE_DIR, { path }),
    permissionDenied: (path: string) =>
      formatErrorMessage(ERROR_MESSAGES.FILE_SYSTEM.PERMISSION_DENIED, { path }),
    pathNotExists: (path: string) =>
      formatErrorMessage(ERROR_MESSAGES.FILE_SYSTEM.PATH_NOT_EXISTS, { path }),
    pathAlreadyExists: (path: string) =>
      formatErrorMessage(ERROR_MESSAGES.FILE_SYSTEM.PATH_ALREADY_EXISTS, { path }),
  },

  dependency: {
    installFailed: (packageManager: string) =>
      formatErrorMessage(ERROR_MESSAGES.DEPENDENCY.INSTALL_FAILED, { packageManager }),
    packageManagerNotFound: (packageManager: string) =>
      formatErrorMessage(ERROR_MESSAGES.DEPENDENCY.PACKAGE_MANAGER_NOT_FOUND, { packageManager }),
    dependencyConflict: (dependency: string) =>
      formatErrorMessage(ERROR_MESSAGES.DEPENDENCY.DEPENDENCY_CONFLICT, { dependency }),
    invalidVersion: (dependency: string, version: string) =>
      formatErrorMessage(ERROR_MESSAGES.DEPENDENCY.INVALID_VERSION, { dependency, version }),
  },

  network: {
    connectionFailed: () => ERROR_MESSAGES.NETWORK.CONNECTION_FAILED,
    timeout: () => ERROR_MESSAGES.NETWORK.TIMEOUT,
    downloadFailed: (url: string) =>
      formatErrorMessage(ERROR_MESSAGES.NETWORK.DOWNLOAD_FAILED, { url }),
    registryUnavailable: () => ERROR_MESSAGES.NETWORK.REGISTRY_UNAVAILABLE,
  },

  configuration: {
    invalidConfig: () => ERROR_MESSAGES.CONFIGURATION.INVALID_CONFIG,
    missingConfigField: (field: string) =>
      formatErrorMessage(ERROR_MESSAGES.CONFIGURATION.MISSING_CONFIG_FIELD, { field }),
    configParseError: (path: string) =>
      formatErrorMessage(ERROR_MESSAGES.CONFIGURATION.CONFIG_PARSE_ERROR, { path }),
    incompatibleOptions: (options: string) =>
      formatErrorMessage(ERROR_MESSAGES.CONFIGURATION.INCOMPATIBLE_OPTIONS, { options }),
  },

  userInput: {
    operationCancelled: () => ERROR_MESSAGES.USER_INPUT.OPERATION_CANCELLED,
    invalidInput: (input: string) =>
      formatErrorMessage(ERROR_MESSAGES.USER_INPUT.INVALID_INPUT, { input }),
    inputRequired: (field: string) =>
      formatErrorMessage(ERROR_MESSAGES.USER_INPUT.INPUT_REQUIRED, { field }),
    inputTooLong: (field: string) =>
      formatErrorMessage(ERROR_MESSAGES.USER_INPUT.INPUT_TOO_LONG, { field }),
    inputTooShort: (field: string) =>
      formatErrorMessage(ERROR_MESSAGES.USER_INPUT.INPUT_TOO_SHORT, { field }),
  },

  system: {
    unexpectedError: () => ERROR_MESSAGES.SYSTEM.UNEXPECTED_ERROR,
    insufficientPermissions: () => ERROR_MESSAGES.SYSTEM.INSUFFICIENT_PERMISSIONS,
    diskSpaceFull: () => ERROR_MESSAGES.SYSTEM.DISK_SPACE_FULL,
    memoryError: () => ERROR_MESSAGES.SYSTEM.MEMORY_ERROR,
    processFailed: (process: string) =>
      formatErrorMessage(ERROR_MESSAGES.SYSTEM.PROCESS_FAILED, { process }),
  },

  generator: {
    generatorFailed: (generator: string) =>
      formatErrorMessage(ERROR_MESSAGES.GENERATOR.GENERATOR_FAILED, { generator }),
    templateNotFound: (template: string) =>
      formatErrorMessage(ERROR_MESSAGES.GENERATOR.TEMPLATE_NOT_FOUND, { template }),
    templateRenderError: (template: string) =>
      formatErrorMessage(ERROR_MESSAGES.GENERATOR.TEMPLATE_RENDER_ERROR, { template }),
    missingGenerator: (type: string) =>
      formatErrorMessage(ERROR_MESSAGES.GENERATOR.MISSING_GENERATOR, { type }),
  },

  git: {
    initFailed: () => ERROR_MESSAGES.GIT.INIT_FAILED,
    gitNotFound: () => ERROR_MESSAGES.GIT.GIT_NOT_FOUND,
    repoAlreadyExists: () => ERROR_MESSAGES.GIT.REPO_ALREADY_EXISTS,
  },
}
