
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Plus, AlertTriangle, Hospital, User } from 'lucide-react';

const EmergencyContacts = () => {
  const contacts = [
    {
      id: '1',
      name: 'Emergency Services',
      number: '911',
      type: 'emergency',
      icon: AlertTriangle
    },
    {
      id: '2',
      name: 'Dr. Sarah Johnson',
      number: '+1 (555) 123-4567',
      type: 'doctor',
      icon: Hospital
    },
    {
      id: '3',
      name: 'John Doe (Emergency Contact)',
      number: '+1 (555) 987-6543',
      type: 'family',
      icon: User
    }
  ];

  const getContactStyle = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'doctor': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      default: return 'bg-green-50 border-green-200 hover:bg-green-100';
    }
  };

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Phone className="h-5 w-5 text-red-600" />
            <span>Emergency Contacts</span>
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {contacts.map((contact) => {
          const Icon = contact.icon;
          return (
            <div key={contact.id} className={`p-3 border rounded-lg transition-colors ${getContactStyle(contact.type)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{contact.name}</h4>
                    <p className="text-sm text-gray-600">{contact.number}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleCall(contact.number)}
                  className={`${contact.type === 'emergency' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default EmergencyContacts;
