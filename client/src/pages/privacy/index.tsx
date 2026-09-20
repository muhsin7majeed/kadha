import { Box, Container, Heading, Link as ChakraLink, List, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router';

import BetaDisclosure from '@/components/beta-disclosure';
import Navbar from '@/components/navbar';
import { APP_CONFIG } from '@/config/app-config';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box as="section">
    <Heading textStyle="sectionTitle" mb={3}>
      {title}
    </Heading>
    <VStack align="start" gap={3} color="fg.muted">
      {children}
    </VStack>
  </Box>
);

const Privacy = () => {
  return (
    <Box minH="100vh">
      <Navbar />
      <BetaDisclosure />

      <Box py={{ base: 12, md: 16 }}>
        <Container maxW="3xl" px={{ base: 4, md: 6 }}>
          <VStack align="start" gap={8}>
            <Box>
              <Heading size={{ base: '2xl', md: '3xl' }} mb={4}>
                Privacy Policy
              </Heading>
              <Text color="fg.muted">
                This policy explains how {APP_CONFIG.appName} handles data for the hosted beta and how self-hosted
                deployments differ. Effective September 20, 2026.
              </Text>
            </Box>

            <Section title="Hosted Beta">
              <Text>
                The hosted Kadha beta is built and operated by a small team. Automated encrypted backups are in place,
                but mistakes, software failures, or infrastructure failures could still cause data loss. Export anything
                you would not want to recreate, and do not add information you consider highly sensitive.
              </Text>
              <Text>
                The hosted beta is not end-to-end encrypted. Passwords are hashed, but account data and media activity
                are stored in the application database in a form the application server and instance operator can
                access.
              </Text>
              <Text>
                Kadha does not require an email address or phone number, but that does not make an account anonymous.
                Usernames are searchable, social and media activity can identify someone, and servers may process
                network information such as IP addresses. Kadha should be treated as pseudonymous.
              </Text>
            </Section>

            <Section title="Visibility And Sharing">
              <Text>
                New accounts start with their profile, watched list, liked list, and watchlist visible only to the
                account owner. New collections also start private. Existing visibility choices are not changed
                automatically.
              </Text>
              <List.Root ps={5}>
                <List.Item>
                  Anyone on the web means people can read that profile section or collection without creating a Kadha
                  account.
                </List.Item>
                <List.Item>Kadha users means signed-in users on the same Kadha instance can access it.</List.Item>
                <List.Item>Friends means accepted friends can access it.</List.Item>
                <List.Item>
                  Only me means other users cannot access that profile section. An Only me collection remains available
                  to its owner and any members the owner explicitly invited.
                </List.Item>
                <List.Item>
                  Collection members can access a collection intentionally shared with them, according to their viewer
                  or editor role, even when it is not visible to other users.
                </List.Item>
              </List.Root>
              <Text>
                Usernames remain searchable unless one user blocks the other. People who can see shared data may copy or
                disclose it outside Kadha, which Kadha cannot prevent.
              </Text>
            </Section>

            <Section title="Data Kadha Stores">
              <Text>Kadha may store the following data when you use the hosted beta:</Text>
              <List.Root ps={5}>
                <List.Item>
                  Username, password hash, account role, watch region, privacy settings, Home and navigation preferences,
                  session version, timestamps, and an account recovery-code verifier.
                </List.Item>
                <List.Item>
                  Watched, liked, and watchlist items, including ratings, private notes, watched dates, repeat watches,
                  and individual TV episode history.
                </List.Item>
                <List.Item>
                  Collections, descriptions, items, visibility, members, roles, invitations, and who added an item.
                </List.Item>
                <List.Item>
                  Recommendation settings and feedback used to tune suggestions for the account that submitted them.
                </List.Item>
                <List.Item>Friendships, blocks, notifications, and account activity records.</List.Item>
                <List.Item>Movie and TV metadata copied from TMDB for saved items.</List.Item>
              </List.Root>
            </Section>

            <Section title="How Kadha Uses Data">
              <Text>
                Kadha processes account and media data to provide tracking, visibility controls, sharing, recovery,
                security, support, and service maintenance. Administrators can see limited operational information such
                as usernames, roles, privacy settings, account dates, and per-user counts of tracked items, collections,
                and friends.
              </Text>
              <Text>
                Kadha does not sell or rent personal data, use it to target advertising, build unrelated marketing
                profiles, or train AI models. Private viewing insights and recommendations are calculated from the
                signed-in user's own allowed tracking signals, settings, and recommendation feedback. One user's
                preferences or location do not affect another user's recommendations.
              </Text>
              <Text>
                Upcoming schedules are derived from the signed-in user's tracked titles and current media metadata. They
                are private, are not exposed on profiles, and do not create a new shared or portable data category.
              </Text>
            </Section>

            <Section title="Data Kadha Does Not Currently Request">
              <List.Root ps={5}>
                <List.Item>Email addresses.</List.Item>
                <List.Item>Phone numbers.</List.Item>
                <List.Item>Payment information.</List.Item>
                <List.Item>Advertising identifiers.</List.Item>
                <List.Item>Advertising or behavioral-analytics events.</List.Item>
              </List.Root>
            </Section>

            <Section title="Operator Access">
              <Text>
                The hosted operator can technically access the application database, private account content, and any
                backups. The operator does not routinely inspect private content. Human access should occur only when
                necessary for support requested by a user, security or abuse investigation, maintenance or recovery, or
                legal obligations.
              </Text>
              <Text>
                This is an operational promise, not a cryptographic guarantee. Kadha does not currently protect hosted
                data from a malicious or legally compelled operator, a server or database compromise, someone with
                access to your device or session, or a person copying data you shared with them.
              </Text>
            </Section>

            <Section title="Cookies, Network Data, And Logs">
              <Text>
                Kadha uses authentication tokens and a necessary HTTP-only refresh cookie to keep users signed in. It
                does not currently use advertising or analytics cookies.
              </Text>
              <Text>
                The application temporarily processes IP addresses in memory to rate-limit registration, login,
                session-refresh, account-recovery, and other sensitive authentication requests. Hosting infrastructure
                may also process network traffic and operational logs. Formal retention periods for operational logs
                and obsolete application records have not yet been established.
              </Text>
            </Section>

            <Section title="TMDB And Third Parties">
              <Text>
                Kadha uses TMDB for movie and TV metadata. This product uses the TMDB API but is not endorsed or
                certified by TMDB.
              </Text>
              <Text>
                Media searches and lookups are sent from the Kadha server to TMDB. Artwork is loaded directly from
                TMDB's image service, so TMDB can receive the viewer's IP address and the requested image path. Hosting
                providers also process the network and storage data needed to run the hosted service. A future payment
                provider will be identified before payments are accepted.
              </Text>
            </Section>

            <Section title="Account Recovery">
              <Text>
                Kadha issues a private recovery code without requiring an email address or phone number. The plaintext
                code is shown when it is created, while Kadha stores only a one-way verifier and its issue date.
              </Text>
              <Text>
                Anyone with your username and recovery code can reset your password. Keep the code private and outside
                Kadha. If you lose both your password and recovery code, the account cannot be recovered through the
                product or support.
              </Text>
              <Text>
                You can change your password from Settings after entering your current password. A successful change
                immediately signs out every existing session, including the device used to make the change.
              </Text>
            </Section>

            <Section title="Data Export And Deletion">
              <Text>
                You can download a JSON export from Settings containing account settings, Home and navigation preferences,
                saved media, collections, episode-watch history, sharing, friendships, notifications, and activity.
              </Text>
              <Text>
                You can permanently delete your account from Settings after entering your current password and an
                explicit confirmation phrase. Before deletion, Kadha shows how collaboration will be affected. You may
                explicitly transfer a shared collection to one of its accepted members; its metadata, items, and other
                memberships then remain under the new owner. Collections you do not transfer are removed from the live
                database. Affected users receive anonymous system notifications that do not retain the deleted username
                or link to deleted collections. The action signs out all existing sessions and cannot be reversed
                through account recovery.
              </Text>
              <Text>
                Encrypted database backups can retain deleted data until the instance operator rotates those backups.
                Backup retention is count-based, and a restored older backup can temporarily reintroduce data that was
                deleted after that backup was created. Operators are responsible for reconciling later deletions after a
                restore. Formal time-based backup-retention periods and a private support channel are not currently
                available. Do not post your username, recovery code, or account data in a public GitHub issue.
              </Text>
            </Section>

            <Section title="Self-Hosted Instances">
              <Text>
                If you self-host Kadha, that instance's operator controls its database, logs, backups, secrets, access
                policies, and third-party providers. This hosted beta policy does not control third-party or personal
                self-hosted instances.
              </Text>
            </Section>

            <Section title="General Feedback">
              <Text>
                General product feedback can be shared through{' '}
                <ChakraLink asChild color="brand.fg">
                  <a href={`${APP_CONFIG.githubUrl}/issues`} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </ChakraLink>
                . GitHub issues are public and are not a private support or account-deletion channel.
              </Text>
              <ChakraLink asChild color="brand.fg">
                <Link to="/">Back to home</Link>
              </ChakraLink>
            </Section>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Privacy;
