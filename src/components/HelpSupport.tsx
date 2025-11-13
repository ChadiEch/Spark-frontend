import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  BookOpen, 
  Mail, 
  MessageCircle, 
  Users, 
  Search,
  ChevronRight,
  FileText,
  HelpCircle,
  Clock,
  Phone,
  MapPin
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export function HelpSupport() {
  const [activeSection, setActiveSection] = useState<'overview' | 'faq' | 'contact' | 'community'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock FAQ data
  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I reset my password?',
      answer: 'You can reset your password by going to Settings > Security > Change Password. If you\'ve forgotten your current password, use the "Forgot Password" link on the login page.',
      category: 'Account'
    },
    {
      id: '2',
      question: 'How do I invite team members?',
      answer: 'Go to Settings > Team and click "Invite Member". Enter their email address and select their role. They will receive an email invitation to join your workspace.',
      category: 'Team Management'
    },
    {
      id: '3',
      question: 'How do I create a new campaign?',
      answer: 'Navigate to Goals & Campaigns and click the "New Campaign" button. Fill in the campaign details, set your goals, and assign team members to get started.',
      category: 'Campaigns'
    },
    {
      id: '4',
      question: 'How do I connect social media accounts?',
      answer: 'Go to Settings > Integrations and click "Connect" next to the social media platform you want to connect. Follow the authentication flow to authorize access.',
      category: 'Integrations'
    },
    {
      id: '5',
      question: 'How do I export reports?',
      answer: 'In the Analytics section, select the data range and metrics you want to export. Click the "Export" button and choose your preferred format (PDF, CSV, or Excel).',
      category: 'Analytics'
    },
    {
      id: '6',
      question: 'What are the system requirements?',
      answer: 'Winnerforce works on all modern browsers (Chrome, Firefox, Safari, Edge). For the best experience, keep your browser updated. Mobile apps are available for iOS and Android.',
      category: 'Technical'
    }
  ];

  // Mock support tickets
  const supportTickets: SupportTicket[] = [
    {
      id: '001',
      subject: 'Unable to connect Instagram account',
      description: 'I\'m having trouble connecting my Instagram business account to Winnerforce.',
      status: 'in-progress',
      createdAt: '2023-06-15T10:30:00Z',
      updatedAt: '2023-06-15T14:22:00Z'
    },
    {
      id: '002',
      subject: 'Report generation is slow',
      description: 'Generating monthly reports takes longer than expected.',
      status: 'open',
      createdAt: '2023-06-10T09:15:00Z',
      updatedAt: '2023-06-10T09:15:00Z'
    }
  ];

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Support Ticket Submitted",
        description: "We've received your request and will get back to you within 24 hours.",
      });
      
      // Reset form
      setSubject('');
      setDescription('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit support ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in-progress': return 'secondary';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveSection('faq')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Find answers to common questions about using Winnerforce
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">
              Browse FAQ <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveSection('contact')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Get help from our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">
              Submit Request <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Documentation
            </CardTitle>
            <CardDescription>
              Comprehensive guides and tutorials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.open('/docs', '_blank')}>
              View Documentation
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveSection('community')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Community
            </CardTitle>
            <CardDescription>
              Connect with other Winnerforce users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">
              Join Community <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Email Support</h4>
            <p className="text-sm text-muted-foreground">chadiech18@gmail.com</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Phone Support</h4>
            <p className="text-sm text-muted-foreground">+961 81 445 964</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Office Hours</h4>
            <p className="text-sm text-muted-foreground">Mon-Fri, 9AM-5PM</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFAQ = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setSearchQuery('')} variant="outline">
          Clear
        </Button>
      </div>

      {filteredFaqs.length > 0 ? (
        <div className="grid gap-4">
          {filteredFaqs.map((faq) => (
            <Card key={faq.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                  <Badge variant="secondary">{faq.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No FAQs Found</h3>
            <p className="text-muted-foreground">
              We couldn't find any FAQs matching "{searchQuery}". Try a different search term.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Request</CardTitle>
          <CardDescription>
            Our support team will get back to you within 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide as much detail as possible about your issue"
                rows={5}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Support Tickets</CardTitle>
          <CardDescription>
            Track the status of your support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {supportTickets.length > 0 ? (
            <div className="space-y-4">
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{ticket.subject}</h4>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(ticket.status)}>
                    {ticket.status.replace('-', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              You haven't submitted any support tickets yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCommunity = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Winnerforce Community
          </CardTitle>
          <CardDescription>
            Connect with other users, share tips, and get advice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold">Knowledge Base</h3>
              <p className="text-sm text-muted-foreground">
                Articles and guides written by our team and community
              </p>
            </div>
            <Button variant="outline">Browse</Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold">User Forum</h3>
              <p className="text-sm text-muted-foreground">
                Ask questions and discuss with other users
              </p>
            </div>
            <Button variant="outline">Join Discussion</Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold">Community Events</h3>
              <p className="text-sm text-muted-foreground">
                Webinars, workshops, and meetups
              </p>
            </div>
            <Button variant="outline">View Events</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Community Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Be respectful and constructive in all interactions</li>
            <li>• Search before posting to avoid duplicates</li>
            <li>• Provide context when asking for help</li>
            <li>• Share knowledge and help others when possible</li>
            <li>• Report inappropriate content to moderators</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Help & Support</h2>
          <p className="text-muted-foreground">
            Get help with using Winnerforce and connect with our community
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeSection === 'overview' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveSection('overview')}
          >
            Overview
          </Button>
          <Button 
            variant={activeSection === 'faq' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveSection('faq')}
          >
            FAQ
          </Button>
          <Button 
            variant={activeSection === 'contact' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveSection('contact')}
          >
            Contact
          </Button>
          <Button 
            variant={activeSection === 'community' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveSection('community')}
          >
            Community
          </Button>
        </div>
      </div>

      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'faq' && renderFAQ()}
      {activeSection === 'contact' && renderContact()}
      {activeSection === 'community' && renderCommunity()}
    </div>
  );
}
