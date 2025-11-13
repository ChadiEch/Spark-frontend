import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export function TermsOfService() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Terms of Service</h2>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <FileText className="h-4 w-4 mr-2" />
          Print Terms
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
          <CardDescription>
            By accessing or using Winnerforce Spark, you agree to be bound by these Terms of Service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            These Terms of Service ("Terms") govern your access to and use of the Winnerforce Spark platform, 
            including any content, functionality, and services offered on or through our website and application 
            (collectively, the "Service"). Please read these Terms carefully before using the Service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Description of Service</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Winnerforce Spark is a social media management and ambassador marketing platform that helps businesses 
            manage their social media presence, track ambassador performance, and organize marketing campaigns.
          </p>
          <p className="text-muted-foreground">
            The Service includes features such as content scheduling, analytics, team collaboration tools, 
            ambassador management, asset organization, and integration with various social media platforms.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. User Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            To access certain features of the Service, you may be required to create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Accept responsibility for all activities that occur under your account</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. User Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You retain all rights to any content you upload, post, or display on or through the Service ("User Content"). 
            By posting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, 
            adapt, publish, translate, and distribute your User Content in any existing or future media.
          </p>
          <p className="text-muted-foreground">
            You represent and warrant that you have the right to grant these rights to us, and that your User Content 
            does not infringe the rights of any third party.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The Service and its original content, features, and functionality are owned by Winnerforce Spark and 
            are protected by international copyright, trademark, patent, trade secret, and other intellectual 
            property or proprietary rights laws.
          </p>
          <p className="text-muted-foreground">
            The Winnerforce Spark name, logo, and all related names, logos, product and service names, designs, 
            and slogans are trademarks of Winnerforce Spark or its affiliates or licensors.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Termination</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We may terminate or suspend your account and bar access to the Service immediately, without prior 
            notice or liability, under our sole discretion, for any reason whatsoever and without limitation, 
            including but not limited to a breach of the Terms.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Disclaimer of Warranties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without 
            warranties of any kind, whether express or implied, including, but not limited to, implied warranties 
            of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            In no event shall Winnerforce Spark, nor its directors, employees, partners, agents, suppliers, 
            or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, 
            including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
            resulting from your access to or use of or inability to access or use the Service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Governing Law</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], 
            without regard to its conflict of law provisions.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
            If a revision is material, we will provide at least 30 days' notice prior to any new terms 
            taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}