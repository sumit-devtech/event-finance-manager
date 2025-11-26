/**
 * Footer Component
 * 
 * Application footer with links and copyright information
 */

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Simplifi</span>
            </div>
            <p className="text-gray-600 text-sm">
              Event budget planning and expense management system.
              Streamline your event finances with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/dashboard"
                  className="text-gray-600 hover:text-purple-600 text-sm transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/events"
                  className="text-gray-600 hover:text-purple-600 text-sm transition-colors"
                >
                  Events
                </a>
              </li>
              <li>
                <a
                  href="/expenses"
                  className="text-gray-600 hover:text-purple-600 text-sm transition-colors"
                >
                  Expenses
                </a>
              </li>
              <li>
                <a
                  href="/reports"
                  className="text-gray-600 hover:text-purple-600 text-sm transition-colors"
                >
                  Reports
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/subscription"
                  className="text-gray-600 hover:text-purple-600 text-sm transition-colors"
                >
                  Subscription
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 text-sm transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 text-sm transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {currentYear} Simplifi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

