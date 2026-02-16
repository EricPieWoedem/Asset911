import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '../ui/textarea';
import Creatable from 'react-select/creatable';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BadgeInfo } from 'lucide-react';
import AutoCompleteInput from '../AutoCompleteInput';

export const SelectFormField = ({
  form,
  name,
  options,
  label,
  className,
  labelStyle,
  requiredIndicator = false,
  placeholder,
  onCreateOption,
  isLoading,
  disabledField,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { name, onBlur, onChange, ref } }) => (
        <FormItem className={className}>
          <FormLabel className={labelStyle}>
            {label}
            {requiredIndicator && <span className='text-red-600'>*</span>}
          </FormLabel>
          <FormControl>
            <Creatable
              isClearable
              options={options}
              name={name}
              isDisabled={disabledField}
              onBlur={onBlur}
              ref={ref}
              onChange={e => onChange(e && e.value)}
              placeholder={placeholder}
              onCreateOption={onCreateOption}
              isLoading={isLoading}
              value={options?.find(c => c.value === form.watch(name)) || null}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const InputFormField = ({
  form,
  name,
  label,
  type = 'text',
  className,
  labelStyle = 'flex items-center justify-between ',
  requiredIndicator = false,
  placeholder,
  helpText,
  disabled = false,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={labelStyle}>
            <div>
              {label}
              {requiredIndicator && <span className='text-red-600'>*</span>}
            </div>
            {helpText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className='text-xl text-blue-500'>
                    <BadgeInfo size={12} className='ml-2' />
                  </TooltipTrigger>
                  <TooltipContent className='w-80'>
                    <p>{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const AutompleteInputFormField = ({
  form,
  name,
  label,
  type = 'text',
  className,
  labelStyle = 'flex items-center justify-between ',
  requiredIndicator = false,
  placeholder,
  helpText,
  disabled = false,
  options = [],
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={labelStyle}>
            <div>
              {label}
              {requiredIndicator && <span className='text-red-600'>*</span>}
            </div>
            {helpText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className='text-xl text-blue-500'>
                    <BadgeInfo size={12} className='ml-2' />
                  </TooltipTrigger>
                  <TooltipContent className='w-80'>
                    <p>{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </FormLabel>
          <FormControl>
            <AutoCompleteInput
              field={field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              options={options}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const InputFileFormField = ({
  form,
  name,
  label,
  type = 'text',
  className,
  labelStyle,
  requiredIndicator = false,
  placeholder,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { name, onBlur, onChange, ref, disabled } }) => (
        <FormItem className={className}>
          <FormLabel className={labelStyle}>
            {label}
            {requiredIndicator && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className='text-blue-500'>
                    <BadgeInfo size={12} className='ml-2' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Upload a pdf containing all proof of ownership documents
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </FormLabel>
          <FormControl>
            <Input
              name={name}
              isDisabled={disabled}
              onBlur={onBlur}
              ref={ref}
              onChange={e => onChange(e.target.files[0])}
              type={type}
              placeholder={placeholder}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const TextareaFormField = ({
  form,
  name,
  label,
  className,
  labelStyle,
  requiredIndicator = false,
  placeholder,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={labelStyle}>
            {label}
            {requiredIndicator && <span className='text-red-600'>*</span>}
          </FormLabel>
          <FormControl>
            <Textarea {...field} placeholder={placeholder} rows='6' />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
