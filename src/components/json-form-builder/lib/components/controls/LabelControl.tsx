import maxBy from 'lodash/maxBy';
import {
  ControlProps,
  ControlState,
  isControl,
  formatIs,
  isDescriptionHidden,
  NOT_APPLICABLE,
  RankedTester,
  rankWith,
  and,
} from '@jsonforms/core';
import {
  Control,
  withJsonFormsControlProps,
} from '@jsonforms/react';
import merge from 'lodash/merge';
import { VanillaRendererProps, withVanillaControlProps } from '@jsonforms/vanilla-renderers';
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export class LabelControl extends Control<
  ControlProps & VanillaRendererProps,
  ControlState
> {
  render() {
    const {
      classNames,
      description,
      id,
      errors,
      label,
      uischema,
      schema,
      rootSchema,
      visible,
      enabled,
      required,
      path,
      cells,
      config,
    } = this.props;

    const isValid = errors?.length === 0;

    const divClassNames = [classNames?.validation]
      ?.concat(isValid ? classNames?.description : classNames?.validationError)
      ?.join(' ');

    const appliedUiSchemaOptions = merge({}, config, uischema?.options);
    const showDescription = !isDescriptionHidden(
      visible,
      description,
      this?.state?.isFocused,
      appliedUiSchemaOptions?.showUnfocusedDescription
    );
    const testerContext = {
      rootSchema: rootSchema,
      config: config,
    };

    const cell = maxBy(cells, (r) => r?.tester(uischema, schema, testerContext));
    if (
      cell === undefined ||
      cell?.tester(uischema, schema, testerContext) === NOT_APPLICABLE
    ) {
      return null;
    } else {
      return (
        <div
          className={cn(classNames?.wrapper, visible ? '' : 'hidden', 'space-y-2')}
          id={id}
        >
          <div className="text-left z-[1]">
            <div className="space-y-2">
              <h1 className="font-medium text-2xl">
                <span>{schema?.labelPlaceholder}</span>
              </h1>
              {description && (
                <Markdown remarkPlugins={[remarkGfm]} className="prose dark:prose-invert">
                  {description}
                </Markdown>
              )}
            </div>
          </div>
        </div>
      );
    }
  }
}

export const labelControlTester: RankedTester = rankWith(3, and(isControl, formatIs('label')));

export default withVanillaControlProps(withJsonFormsControlProps(LabelControl));