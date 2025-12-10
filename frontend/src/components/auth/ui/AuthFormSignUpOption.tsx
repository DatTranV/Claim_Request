import React from 'react'

export default function AuthFormSignUpOption() {
  return (
    <div className="flex items-center justify-between mt-4">
      <span className="w-1/5 border-b dark:border-gray-600 md:w-1/4" />
      <a
        className="text-xs text-gray-500 uppercase dark:text-gray-400 hover:underline"
        href="#"
      >
        or sign up
      </a>
      <span className="w-1/5 border-b dark:border-gray-400 md:w-1/4" />
    </div>
  )
}
