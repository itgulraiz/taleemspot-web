import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

const VerificationSent = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  // If no user is logged in, redirect to login
  React.useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification Sent
          </h2>
          
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  We've sent a verification email to <strong>{currentUser.email}</strong>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-center text-gray-600">
              Please check your email and click on the verification link to complete your registration.
            </p>
          </div>
          
          <div className="mt-6 text-center">
            <p className="mt-2 text-sm text-gray-600">
              After verifying your email, you can{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                log in to your account
              </Link>
            </p>
          </div>
          
          <div className="mt-6">
            <p className="text-center text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={async () => {
                  try {
                    await currentUser.sendEmailVerification();
                    alert('Verification email sent again. Please check your inbox.');
                  } catch (error) {
                    alert('Too many requests. Please try again later.');
                  }
                }}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                click here to resend
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationSent;
