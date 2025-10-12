module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva característica
        'fix',      // Bug fix
        'docs',     // Documentación
        'style',    // Cambios de formato (no afectan lógica)
        'refactor', // Refactoring de código
        'perf',     // Mejoras de performance
        'test',     // Tests
        'build',    // Cambios en build system o dependencias
        'ci',       // Cambios en CI/CD
        'chore',    // Tareas de mantenimiento
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
