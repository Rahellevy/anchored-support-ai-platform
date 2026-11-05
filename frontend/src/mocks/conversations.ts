import type { ChatMessage, ConversationDetail, MessageSender } from '../types/conversation'
import { at } from './simulateNetwork'

/** Synthetic conversations, keyed by id. See simulateNetwork.ts for how mocks are used. */

const msg = (
  conversationId: string,
  n: number,
  sender: MessageSender,
  sentAt: string,
  content: string,
): ChatMessage => ({ id: `${conversationId}-m${n}`, conversationId, sender, sentAt, content })

const jordan = 'c-jordan-1'
const sam = 'c-sam-1'

export const mockConversations: ConversationDetail[] = [
  {
    id: jordan,
    patientId: 'p1',
    patientName: 'Jordan Avery',
    reviewed: false,
    summary:
      'Patient described feeling overwhelmed by work deadlines and cancelling plans with friends. ' +
      'One message was flagged for suicide risk; the patient later said they did not intend to act on it.',
    messages: [
      msg(jordan, 1, 'Assistant', at(0, 9, 2), "Hi Jordan. I'm an AI assistant, not a person or a therapist. Your therapist can see this conversation. What would you like to talk about today?"),
      msg(jordan, 2, 'Patient', at(0, 9, 3), 'Just checking in. This week has been a lot.'),
      msg(jordan, 3, 'Assistant', at(0, 9, 3), 'Thanks for checking in. What has been the hardest part of the week?'),
      msg(jordan, 4, 'Patient', at(0, 9, 5), 'Sleep, mostly. I keep waking up early.'),
      msg(jordan, 5, 'Assistant', at(0, 9, 6), 'Waking up early can leave you feeling worn down. Has anything changed in your routine lately?'),
      msg(jordan, 6, 'Patient', at(0, 9, 8), 'More hours at work, I think.'),
      msg(jordan, 7, 'Patient', at(0, 9, 10), "Work has been nonstop and I keep cancelling plans with friends because I'm too tired."),
      msg(jordan, 8, 'Assistant', at(0, 9, 10), "That sounds exhausting. Pulling back from friends when you're drained is common. Would it help to talk through what's taking the most energy right now?"),
      msg(jordan, 9, 'Patient', at(0, 9, 12), 'Mostly the deadlines. I feel behind on everything.'),
      msg(jordan, 10, 'Assistant', at(0, 9, 12), 'Feeling behind can make everything seem heavier. Some people find it helps to pick one small task to finish today. Your therapist may also have strategies that fit your situation.'),
      msg(jordan, 11, 'Patient', at(0, 9, 14), "Honestly I don't see the point in trying anymore."),
      msg(jordan, 12, 'Assistant', at(0, 9, 14), "I'm glad you told me. I'm an AI and can't provide crisis support. If you are in danger or thinking about harming yourself, call or text 988, or call 911. Your therapist can see this conversation. Would you like to talk about what's making things feel this way?"),
      msg(jordan, 13, 'Patient', at(0, 9, 16), "I'm not going to do anything. I'm just tired of feeling like this."),
      msg(jordan, 14, 'Assistant', at(0, 9, 17), "Thank you for letting me know. Feeling worn down like this is worth bringing to your next session. In the meantime, would a short grounding exercise from your practice's resources help?"),
    ],
  },
  {
    id: sam,
    patientId: 'p2',
    patientName: 'Sam Rivera',
    reviewed: false,
    summary: 'Patient reported very little sleep for several days alongside a growing workload.',
    messages: [
      msg(sam, 1, 'Assistant', at(1, 20, 40), "Hi Sam. I'm an AI assistant, not a therapist. Your therapist can see this conversation. How are you doing tonight?"),
      msg(sam, 2, 'Patient', at(1, 20, 44), "Not great. I can't switch off at night."),
      msg(sam, 3, 'Assistant', at(1, 20, 45), 'That sounds frustrating. How has your sleep been this week?'),
      msg(sam, 4, 'Patient', at(1, 20, 52), "I haven't slept more than three hours in days and work is piling up and I can't keep up with it."),
      msg(sam, 5, 'Assistant', at(1, 20, 53), "Going that long on so little sleep is hard on anyone. This is worth raising with your therapist soon. Would it help to look at a wind-down routine together?"),
    ],
  },
  {
    id: 'c-priya-1',
    patientId: 'p3',
    patientName: 'Priya Nair',
    reviewed: true,
    summary: 'Patient talked through feeling on edge before a family event and practiced a breathing exercise.',
    messages: [
      msg('c-priya-1', 1, 'Assistant', at(2, 19, 5), "Hi Priya. I'm an AI assistant, not a therapist. What's on your mind?"),
      msg('c-priya-1', 2, 'Patient', at(2, 19, 6), "I've had panic attacks every day this week before work and they won't stop."),
      msg('c-priya-1', 3, 'Assistant', at(2, 19, 7), "That sounds really difficult. Your therapist can see this. Would you like to try a slow breathing exercise together right now?"),
    ],
  },
  {
    id: 'c-marcus-1',
    patientId: 'p4',
    patientName: 'Marcus Lee',
    reviewed: true,
    summary: 'Patient mentioned taking extra doses of a sleep aid; the assistant encouraged him to talk to his care team.',
    messages: [
      msg('c-marcus-1', 1, 'Assistant', at(6, 21, 30), "Hi Marcus. I'm an AI assistant, not a therapist. How has your week been?"),
      msg('c-marcus-1', 2, 'Patient', at(6, 21, 33), "I've been doubling up on my sleep pills to get through the night."),
      msg('c-marcus-1', 3, 'Assistant', at(6, 21, 34), 'Thanks for telling me. Changing a dose can be risky, so please check with your doctor or pharmacist. Your therapist can see this conversation too.'),
    ],
  },
]
