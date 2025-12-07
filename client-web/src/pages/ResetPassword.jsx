import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../store/authStore';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromQuery = searchParams.get('token') || '';
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { resetPassword, isLoading } = useAuthStore();
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (tokenFromQuery) {
      setValue('token', tokenFromQuery);
      // Optionally validate token with backend
      (async () => {
        setValidating(true);
        try {
          await api.get(`/users/validate-reset/${encodeURIComponent(tokenFromQuery)}`);
          // valid
        } catch (err) {
          toast.error(err.response?.data?.message || 'Invalid or expired token');
          navigate('/forgot-password');
        } finally {
          setValidating(false);
        }
      })();
    }
  }, [tokenFromQuery, setValue, navigate]);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await resetPassword(data.token, data.password);
      toast.success('Password updated — please login');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Set a new password</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Choose a secure password to finish resetting your account.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('token', { required: true })} />

          <Input
            label="New password"
            type="password"
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
            error={errors.password?.message}
          />

          <Input
            label="Confirm password"
            type="password"
            {...register('confirmPassword', { required: 'Confirm your password' })}
            error={errors.confirmPassword?.message}
          />

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading || validating}>Set password</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
