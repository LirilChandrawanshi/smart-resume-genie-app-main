
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">About ResumeGenie</h1>
            <p className="text-muted-foreground">
              The smart way to build professional resumes that stand out.
            </p>
          </div>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="mb-4">
                ResumeGenie was created with a simple mission: to help people create professional, 
                eye-catching resumes without the hassle. Founded in 2025 by Liril Chandrawanshi, 
                our platform combines intuitive design with powerful AI to make resume creation simple and effective.
              </p>
              <p>
                As someone who has experienced the challenges of job hunting firsthand, 
                Liril understood the importance of a well-crafted resume in making a strong first impression. 
                This personal experience inspired the creation of ResumeGenie—a tool that empowers 
                users to highlight their unique skills and experiences.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Meet the Developer</h2>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="w-40 h-40 bg-gray-200 rounded-full overflow-hidden">
                    <img 
                      src="https://media.licdn.com/dms/image/v2/D4D03AQHiC3OBsQFurw/profile-displayphoto-shrink_800_800/B4DZYtrCneHAAg-/0/1744522982025?e=1770249600&v=beta&t=6MY2hDMz2g4bds7FC4EG3ad1c37LDyyHodZN1zI3WlI"
                      alt="Liril Chandrawanshi"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <h3 className="text-xl font-medium mb-2">Liril Chandrawanshi</h3>
                  <p className="text-muted-foreground mb-2">Founder & Lead Developer</p>
                  <Separator className="my-3" />
                  <p className="mb-3">
                    Liril is a passionate full-stack developer with expertise in React, Spring Boot, and AI technologies. 
                    With a strong background in user experience design and software development, 
                    she combines technical knowledge with a keen eye for detail to create intuitive, user-friendly applications.
                  </p>
                  <p>
                    When not coding, Liril enjoys hiking, reading science fiction, and contributing to open-source projects. 
                    She is committed to making technology more accessible and empowering people through innovative digital solutions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="mb-4">
                At ResumeGenie, we believe everyone deserves access to tools that help them showcase their professional 
                journey effectively. Our mission is to level the playing field in the job market by providing 
                accessible, high-quality resume building tools powered by the latest technology.
              </p>
              <p>
                We're committed to continuously improving our platform based on user feedback and evolving industry standards, 
                ensuring that ResumeGenie remains at the forefront of resume creation technology.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default About;
