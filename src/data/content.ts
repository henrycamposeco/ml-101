
import type { Topic } from './types';

export const topics: Topic[] = [
    {
        id: 'introduction',
        title: 'Introduction',
        description: 'Bridging the gap between software engineering and data science.',
        slides: [
            {
                id: 'intro-title',
                title: 'The "Hello World" of Machine Learning',
                content: `<h3>Bridging the gap between writing code and training models.</h3>
                          <p>Moving beyond "dry math topics" to practical application in <strong>Systems and IT</strong>.</p>
                          <p>We are shifting from writing explicit rules to training intelligent models.</p>`,
                config: { animationType: 'bridge', color: '#4B286D', speed: 0.5 }
            },
            {
                id: 'intro-landscape',
                title: 'The AI Landscape: Where are we?',
                content: `<p><strong>AI</strong> is the broad umbrella. <strong>Machine Learning</strong> is the subset where we don't 'hard-code' solutions, but let algorithms find the mapping from data.</p>`,
                config: { animationType: 'ai-landscape', color: '#4B286D', speed: 1.0 }
            },

            {
                id: 'intro-patterns',
                title: 'Machine Learning: From Rules to Patterns',
                content: `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                            <div>
                              <h4 style="margin-top: 0; color: #aaa;">Traditional Programming</h4>
                              <p style="font-size: 1.2em; font-weight: bold;">Data + Rules = Output</p>
                              <p>We write explicit if/else logic.</p>
                            </div>
                            <div>
                              <h4 style="margin-top: 0; color: #66CC00;">Machine Learning</h4>
                              <p style="font-size: 1.2em; font-weight: bold;">Data + Output = Rules</p>
                              <p>The machine generates the "Rules" (Model).</p>
                            </div>
                          </div>`,
                config: { animationType: 'programming-paradigm', color: '#66CC00', speed: 0.8 }
            }
        ],
    },
    {
        id: 'linear-regression-deep-dive',
        title: 'Linear Regression: Deep Dive',
        description: 'A comprehensive look at the "Hello World" of ML.',
        slides: [
            {
                id: 'lr-hello-world',
                title: 'Linear Regression: The "Hello World"',
                content: `<p>Think of Machine Learning as a pretty awesome skill, and <strong>Linear Regression</strong> is the straightforward, essential tool you grab first. Its job is super simple: <strong>find the straight-line pattern hidden in a bunch of messy data</strong>.</p>
                          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 15px 0;">
                             <p><strong>Everyday Example:</strong> Server Load vs. Response Time.</p>
                             <p>When server load (X) goes up, waiting time (Y) usually goes up.</p>
                          </div>
                          <p>Linear Regression draws the single best straight line through the dots. That line is our <strong>model</strong>. It lets us predict the future: "If load hits X, wait time will be Y."</p>`,
                config: { animationType: 'linear-regression', color: '#4B286D' }
            },
            {
                id: 'lr-anatomy',
                title: 'The Anatomy of the Equation',
                content: `<p>We are all familiar with <em>y = mx + b</em>. In ML, we give them cooler names:</p>
                          <div style="font-size: 2em; text-align: center; margin: 20px 0; font-family: monospace; color: #260b52ff;">y = wx + b</div>
                          <ul style="line-height: 1.6;">
                             <li><strong style="color: #260b52ff;">y (Output)</strong>: The prediction (e.g. Response Time).</li>
                             <li><strong style="color: #555;">x (Input)</strong>: The feature (e.g. Server Load).</li>
                             <li><strong style="color: #971748ff;">w (Weight)</strong>: Was slope. Strength/Direction.</li>
                             <li><strong style="color: #fc8f00ff;">b (Bias)</strong>: Was intercept. Baseline value.</li>
                          </ul>
                          <p>Training a model is just verifying the machine to find the <strong>best w and b</strong> that makes the line fit tight.</p>`,
                config: { animationType: 'equation', color: '#4B286D' }
            },
            {
                id: 'lr-cost-function',
                title: 'How it Learns: The Cost Function',
                content: `<p>How does the machine know if the line is good? The <strong>Cost Function</strong>.</p>
                          <p>It's like a grade book that tracks failures. <br/>
                          <strong>Error</strong> = Distance between data point and the line.</p>
                          <p>The <strong>Cost (Loss)</strong> is the average of all these errors squared.</p>
                          <div style="background: rgba(255,0,0,0.1); padding: 10px; border-left: 4px solid red; margin-top: 10px;">
                             <p><strong>Goal:</strong> "Lower the Number". Minimize the cost as much as possible.</p>
                          </div>`,
                config: { animationType: 'linear-regression', color: '#4B286D' }
            },
            {
                id: 'lr-gradient-descent',
                title: 'Optimization: Gradient Descent',
                content: `<p>The machine minimizes cost using <strong>Gradient Descent</strong>.</p>
                          <p>Imagine being blindfolded on a mountain. You feel the slope with your feet.</p>
                          <ul>
                             <li><strong>Gradient:</strong> Steepest slope.</li>
                             <li><strong>Descent:</strong> Taking small steps downhill.</li>
                          </ul>
                          <p>It iteratively adjusts <strong>Weight</strong> and <strong>Bias</strong> until it hits the bottom of the error curve (lowest cost).</p>`,
                config: { animationType: 'gradient-descent', color: '#4B286D', speed: 1.5 }
            },
            {
                id: 'lr-demo-transition',
                title: 'Transition to Demo',
                content: `<p>Enough theory! Let's roll up our sleeves.</p>
                          <p><strong>Next steps:</strong></p>
                          <ol>
                             <li>Open Google Colab notebook.</li>
                             <li>Clean messy data with <strong>Pandas</strong>.</li>
                             <li>Build/Train Linear Regression with <strong>Scikit-Learn</strong>.</li>
                          </ol>
                          <a href="https://colab.research.google.com/drive/12HdIA245yaQ28uG_QNGyZB-Ih0pQ0LXO" target="_blank">Google Colab Notebook LAB </a>
                          <p style="margin-top: 20px; font-size: 1.2em; font-weight: bold; color: #66CC00;">We're going to watch the machine learn!</p>`,
                config: { animationType: 'particles', color: '#4B286D', speed: 0.5 }
            }
        ]
    },
    {
        id: 'neural-networks',
        title: 'Reinforcement Learning',
        description: 'Learning by trial and error.',
        slides: [
            {
                id: 'rl-1',
                title: 'Soon!',
                content: `Walking Robot<br/><img src="https://gymnasium.farama.org/_static/videos/mujoco/ant.gif" style="width:100%; margin-top: 20px; border-radius: 10px;" />`,
                config: { animationType: 'grid', color: '#4B286D', speed: 0.5 }
            }
        ]
    },
];
