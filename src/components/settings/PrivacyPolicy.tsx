import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Privacy Policy</h2>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <FileText className="h-4 w-4 mr-2" />
          Print Policy
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Information We Collect</CardTitle>
          <CardDescription>
            We collect information to provide better services to all our users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="font-semibold mb-2">Personal Information</h4>
          <p className="text-muted-foreground mb-4">
            We collect personal information that you provide to us, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Name and contact information</li>
            <li>Email address and password</li>
            <li>Company or organization information</li>
            <li>Payment information</li>
            <li>Profile picture and biographical information</li>
          </ul>
          
          <h4 className="font-semibold mb-2">Usage Information</h4>
          <p className="text-muted-foreground mb-4">
            We collect information about how you use our Service, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
            <li>Access times and duration of visits</li>
            <li>Features and content you interact with</li>
            <li>Device information (browser type, operating system, etc.)</li>
            <li>IP address and general location information</li>
            <li>Error logs and diagnostic information</li>
          </ul>
          
          <h4 className="font-semibold mb-2">Social Media Information</h4>
          <p className="text-muted-foreground">
            When you connect social media accounts to our Service, we may collect:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Profile information from connected social media accounts</li>
            <li>Content you post or share through our Service to social media</li>
            <li>Analytics and engagement data from social media platforms</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. How We Use Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Provide, maintain, and improve our Service</li>
            <li>Personalize your experience and customize content</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, and security alerts</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, investigate, and prevent fraudulent transactions</li>
            <li>Comply with legal obligations and protect our rights</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Sharing of Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            We may share information in the following circumstances:
          </p>
          
          <h4 className="font-semibold mb-2">With Your Consent</h4>
          <p className="text-muted-foreground mb-4">
            We may share your information with third parties when you give us consent to do so.
          </p>
          
          <h4 className="font-semibold mb-2">Service Providers</h4>
          <p className="text-muted-foreground mb-4">
            We may share information with vendors, consultants, and other service providers who need 
            access to such information to carry out work on our behalf.
          </p>
          
          <h4 className="font-semibold mb-2">Legal Requirements</h4>
          <p className="text-muted-foreground mb-4">
            We may disclose your information if required to do so by law or in response to valid 
            requests by public authorities.
          </p>
          
          <h4 className="font-semibold mb-2">Business Transfers</h4>
          <p className="text-muted-foreground">
            We may share or transfer your information in connection with, or during negotiations of, 
            any merger, sale of company assets, financing, or acquisition of all or a portion of our 
            business to another company.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Data Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We implement appropriate technical and organizational measures to protect the security 
            of your personal information. However, please note that no method of transmission over 
            the Internet or method of electronic storage is 100% secure.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Data Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We retain your personal information for as long as necessary to provide our Service, 
            comply with legal obligations, resolve disputes, and enforce our agreements. The retention 
            period depends on the purpose for which the data was collected.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Your Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Depending on your location, you may have certain rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>The right to access, update, or delete your personal information</li>
            <li>The right to object to processing of your personal information</li>
            <li>The right to request restriction of processing of your personal information</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Children's Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our Service does not address anyone under the age of 13. We do not knowingly collect 
            personally identifiable information from anyone under the age of 13. If you are a parent 
            or guardian and you are aware that your child has provided us with personal information, 
            please contact us.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Changes to Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We may update our Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>By email: privacy@winnerforcespark.com</li>
            <li>By visiting this page on our website: winnerforcespark.com/contact</li>
            <li>By mail: Winnerforce Spark, [Address], [City, State ZIP Code]</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}