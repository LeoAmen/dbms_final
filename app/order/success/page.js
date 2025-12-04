'use client';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Sparkles, Gift, Package, ArrowLeft, Shield, Truck, Clock } from 'lucide-react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        
        <a href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </a>

        <div className="relative">
          
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Sparkles key={i} className="h-6 w-6 text-blue-300 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
          
          
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-blue-100 relative overflow-hidden">
            
            
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full opacity-50"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-blue-50 to-cyan-50 rounded-full opacity-50"></div>
            
            
            
            <div className="relative mb-6">
              <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                <CheckCircle className="h-20 w-20 text-white" strokeWidth={1.5} />
              </div>
              <div className="absolute top-0 right-10 bg-white p-3 rounded-full shadow-lg border border-blue-100">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <div className="absolute bottom-4 left-10 bg-white p-3 rounded-full shadow-lg border border-blue-100">
                <Truck className="h-6 w-6 text-blue-500" />
              </div>
            </div>

            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Order Confirmed! 
            </h1>
            <p className="text-lg text-gray-600 mb-6 text-center">
              Your order has been successfully placed and is being processed.
            </p>

            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                <span className="text-sm font-medium text-blue-600">ORDER ID</span>
              </div>
              <p className="text-2xl font-mono font-bold text-gray-900 bg-white/70 p-4 rounded-xl text-center border border-blue-100">
                #{orderId || 'XXXX-XXXX-XXXX'}
              </p>
              <p className="text-sm text-gray-500 mt-3 text-center">
                A confirmation email has been sent to your registered email address.
              </p>
            </div>

           
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                What's Next?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100 hover:border-blue-200 transition-colors">
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
                    <Package className="h-6 w-6 text-blue-500" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Order Processed</h4>
                  <p className="text-sm text-gray-600">Within 24 hours</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100 hover:border-blue-200 transition-colors">
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Quality Check</h4>
                  <p className="text-sm text-gray-600">Careful inspection</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100 hover:border-blue-200 transition-colors">
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
                    <Truck className="h-6 w-6 text-blue-500" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Shipping</h4>
                  <p className="text-sm text-gray-600">2-3 business days</p>
                </div>
              </div>
            </div>
            <div className="mt-12 mb-8">
              <a 
                href="/" 
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200 hover:scale-[1.02] transition-all duration-300 mx-auto max-w-md"
              >
                <ArrowLeft className="h-5 w-5" />
                Return to Homepage
              </a>
              <p className="text-center text-gray-500 text-sm mt-4">
                Need help? <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Contact Support</a>
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5 text-blue-500" />
                Estimated Delivery
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                 
                  
                </div>
                <div className="flex justify-between items-center">
                  
                  <span className="font-medium text-gray-900">3-5 business days</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">100% SECURE TRANSACTION</span>
              </div>
              <p className="text-center text-gray-600 text-sm">
                Your payment information is encrypted and secure.
                <br />
                <span className="text-gray-500">All transactions are protected by SSL encryption.</span>
              </p>
            </div>
            
            <div className="mt-10 pt-8 border-t border-blue-100">
              <p className="text-center text-gray-600">
                Thank you for choosing us! 
                <br />
                <span className="text-sm text-gray-500">We're dedicated to providing you with the best shopping experience.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}