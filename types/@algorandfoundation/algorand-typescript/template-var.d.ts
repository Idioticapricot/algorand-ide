/**
 * Declare a template variable which can be replaced at compile time with an environment specific value.
 *
 * The final variable name will be `prefix + variableName`
 * @param variableName The key used to identify the variable.
 * @param prefix The prefix to apply the variable name (Defaults to 'TMPL_')
 */
export declare function TemplateVar<T>(variableName: string, prefix?: string): T;
