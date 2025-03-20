import React from 'react'

export default function GroupSkeleton() {
  return (
    <div className='w-full animate-pulse p-4 sm:p-6'>
        <div className='flex justify-between w-full items-center'>
            <div className='mb-8 h-8 w-1/4 rounded bg-gray-200'></div>
            <div className='mb-8 h-8 w-1/6 rounded bg-gray-200'></div>
        </div>
        <div className='space-y-5 mt-4 p-4'>
            <div className='flex w-full justify-between items-center'>
                <div className='w-full flex space-x-3 items-center'>
                    <div className='h-14 w-14 rounded-full bg-gray-200'></div>
                    <div className='h-5 w-1/5 rounded bg-gray-200'></div>
                </div>
                <div className='h-8 w-1/4 rounded bg-gray-200'></div>
            </div>
            <div className='flex flex-col justify-between items-center space-y-3 px-4 w-full'>
                <div className='flex justify-between items-center w-full'>
                    <div className='flex items-center space-x-3 w-full'>
                        <div className='h-12 w-12 rounded-full bg-gray-200'></div>
                        <div className='h-4 w-1/2 rounded bg-gray-200'></div>
                    </div>
                    <div className='h-5 w-1/6 rounded bg-gray-200'></div>
                </div>
                <div className='flex justify-between items-center w-full'>
                    <div className='flex items-center space-x-3 w-full'>
                        <div className='h-12 w-12 rounded-full bg-gray-200'></div>
                        <div className='h-4 w-1/2 rounded bg-gray-200'></div>
                    </div>
                    <div className='h-5 w-1/6 rounded bg-gray-200'></div>
                </div>
                <div className='flex justify-between items-center w-full'>
                    <div className='flex items-center space-x-3 w-full'>
                        <div className='h-12 w-12 rounded-full bg-gray-200'></div>
                        <div className='h-4 w-1/2 rounded bg-gray-200'></div>
                    </div>
                    <div className='h-5 w-1/6 rounded bg-gray-200'></div>
                </div>
            </div>
        </div>
        <div className='space-y-5 mt-4 p-4'>
            <div className='flex w-full justify-between items-center'>
                <div className='w-full flex space-x-3 items-center'>
                    <div className='h-14 w-14 rounded-full bg-gray-200'></div>
                    <div className='h-5 w-1/5 rounded bg-gray-200'></div>
                </div>
                <div className='h-8 w-1/4 rounded bg-gray-200'></div>
            </div>
            <div className='flex flex-col justify-between items-center space-y-3 px-4 w-full'>
                <div className='flex justify-between items-center w-full'>
                    <div className='flex items-center space-x-3 w-full'>
                        <div className='h-12 w-12 rounded-full bg-gray-200'></div>
                        <div className='h-4 w-1/2 rounded bg-gray-200'></div>
                    </div>
                    <div className='h-5 w-1/6 rounded bg-gray-200'></div>
                </div>
                <div className='flex justify-between items-center w-full'>
                    <div className='flex items-center space-x-3 w-full'>
                        <div className='h-12 w-12 rounded-full bg-gray-200'></div>
                        <div className='h-4 w-1/2 rounded bg-gray-200'></div>
                    </div>
                    <div className='h-5 w-1/6 rounded bg-gray-200'></div>
                </div>
                <div className='flex justify-between items-center w-full'>
                    <div className='flex items-center space-x-3 w-full'>
                        <div className='h-12 w-12 rounded-full bg-gray-200'></div>
                        <div className='h-4 w-1/2 rounded bg-gray-200'></div>
                    </div>
                    <div className='h-5 w-1/6 rounded bg-gray-200'></div>
                </div>
            </div>
        </div>
    </div>
  )
}
